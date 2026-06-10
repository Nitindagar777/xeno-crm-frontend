import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User } from 'lucide-react';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

let googleInitialized = false;

export default function Register() {
  const { register, loginWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleGoogleSuccess = async (response) => {
    setLoading(true);
    try {
      const res = await loginWithGoogle(response.credential);
      if (res.success) {
        toast.success('Registration successful. Welcome!');
      } else {
        toast.error(res.error || 'Google Sign-In failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Google Sign-In failed. Verify backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    const initGoogle = () => {
      if (window.google && window.google.accounts) {
        if (!googleInitialized) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id_here',
            callback: handleGoogleSuccess,
          });
          googleInitialized = true;
        }
        const btn = document.getElementById("googleSignInDiv");
        if (btn) {
          window.google.accounts.id.renderButton(btn, {
            theme: "outline",
            size: "large",
            width: "240",
          });
        }
        if (interval) clearInterval(interval);
      }
    };

    interval = setInterval(() => {
      const btn = document.getElementById("googleSignInDiv");
      if (btn && window.google && window.google.accounts) {
        initGoogle();
        clearInterval(interval);
      }
    }, 100);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const getStrengthLabel = (score) => {
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['bg-danger', 'bg-warning', 'bg-info', 'bg-success', 'bg-success'];
    return {
      label: labels[score - 1] || 'Weak',
      color: colors[score - 1] || 'bg-danger',
      percent: score * 20
    };
  };

  const strength = getStrengthLabel(getPasswordStrength());

  const validate = () => {
    const tempErrors = {};
    if (!name) tempErrors.name = 'Full name is required';
    if (!email) tempErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Invalid email address';
    if (!password) tempErrors.password = 'Password is required';
    else if (password.length < 6) tempErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) tempErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await register(name, email, password);
      if (res.success) {
        toast.success('Registration successful. Welcome!');
      } else {
        toast.error(res.error || 'Registration failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Verify server connection.');
    } finally {
      setLoading(false);
    }
  };

  const parentRegisterVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05
      }
    },
    exit: {
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1
      }
    }
  };

  const childRegisterVariants = {
    initial: { x: 120, y: -120, opacity: 0 },
    animate: { 
      x: 0, 
      y: 0, 
      opacity: 1, 
      transition: { type: 'spring', stiffness: 120, damping: 14 } 
    },
    exit: { 
      x: 120, 
      y: -120, 
      opacity: 0, 
      transition: { ease: 'easeInOut', duration: 0.25 } 
    }
  };

  return (
    <motion.div
      key="register"
      variants={parentRegisterVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full space-y-6"
    >
      <motion.div variants={childRegisterVariants} className="space-y-2">
        <h3 className="text-2xl font-bold text-text-primary tracking-tight">Create Account</h3>
        <p className="text-sm text-text-secondary">Sign up to begin orchestrating targeted campaigns.</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <motion.div variants={childRegisterVariants} className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Full Name</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nitin Patel"
              className={`input-field pl-10 ${errors.name ? 'border-danger/50 focus:border-danger' : ''}`}
            />
            <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-muted" />
          </div>
          {errors.name && <span className="text-[11px] text-danger">{errors.name}</span>}
        </motion.div>

        <motion.div variants={childRegisterVariants} className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Email Address</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@lumiere.com"
              className={`input-field pl-10 ${errors.email ? 'border-danger/50 focus:border-danger' : ''}`}
            />
            <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-muted" />
          </div>
          {errors.email && <span className="text-[11px] text-danger">{errors.email}</span>}
        </motion.div>

        <motion.div variants={childRegisterVariants} className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Password</label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`input-field pl-10 ${errors.password ? 'border-danger/50 focus:border-danger' : ''}`}
            />
            <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-muted" />
          </div>
          {errors.password && <span className="text-[11px] text-danger">{errors.password}</span>}
          
          {/* Strength bar */}
          {password && (
            <div className="pt-2 space-y-1.5">
              <div className="flex justify-between text-[10px] text-text-secondary">
                <span>Password Strength:</span>
                <strong className="text-text-primary">{strength.label}</strong>
              </div>
              <div className="h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.percent}%` }} />
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={childRegisterVariants} className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Confirm Password</label>
          <div className="relative">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={`input-field pl-10 ${errors.confirmPassword ? 'border-danger/50 focus:border-danger' : ''}`}
            />
            <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-muted" />
          </div>
          {errors.confirmPassword && <span className="text-[11px] text-danger">{errors.confirmPassword}</span>}
        </motion.div>

        <motion.div variants={childRegisterVariants}>
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3.5 mt-3"
            loading={loading}
          >
            Register
          </Button>
        </motion.div>
      </form>

      <motion.div variants={childRegisterVariants} className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-surface px-2 text-text-secondary font-semibold">or continue with</span>
        </div>
      </motion.div>

      <motion.div variants={childRegisterVariants} className="flex justify-center w-full">
        <div id="googleSignInDiv" className="w-full min-h-[44px] flex justify-center"></div>
      </motion.div>

      <motion.div variants={childRegisterVariants} className="text-center">
        <p className="text-xs text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-light hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
