import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock } from 'lucide-react';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

let googleInitialized = false;

export default function Login() {
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleGoogleSuccess = async (response) => {
    setLoading(true);
    try {
      const res = await loginWithGoogle(response.credential);
      if (res.success) {
        toast.success('Welcome back to XenoCRM!');
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
        if (btn && btn.children.length === 0) {
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

  const validate = () => {
    const tempErrors = {};
    if (!email) tempErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Invalid email address';
    if (!password) tempErrors.password = 'Password is required';
    else if (password.length < 6) tempErrors.password = 'Password must be at least 6 characters';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success('Welcome back to XenoCRM!');
      } else {
        toast.error(res.error || 'Invalid email or password');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed. Verify server connection.');
    } finally {
      setLoading(false);
    }
  };

  const parentLoginVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05
      }
    },
    exit: {
      transition: {
        staggerChildren: 0.04,
        staggerDirection: -1
      }
    }
  };

  const childLoginVariants = {
    initial: { x: 120, y: 120, opacity: 0 },
    animate: { 
      x: 0, 
      y: 0, 
      opacity: 1, 
      transition: { ease: 'easeOut', duration: 0.45 } 
    },
    exit: { 
      x: 120, 
      y: 120, 
      opacity: 0, 
      transition: { ease: 'easeInOut', duration: 0.25 } 
    }
  };

  return (
    <motion.div
      key="login"
      variants={parentLoginVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full space-y-8"
    >
      <motion.div variants={childLoginVariants} className="space-y-2">
        <h3 className="text-2xl font-bold text-text-primary tracking-tight">Access Dashboard</h3>
        <p className="text-sm text-text-secondary">Enter credentials to manage your store campaigns.</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div variants={childLoginVariants} className="space-y-1">
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

        <motion.div variants={childLoginVariants} className="space-y-1">
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
        </motion.div>

        <motion.div variants={childLoginVariants}>
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3.5 mt-2"
            loading={loading}
          >
            Sign In
          </Button>
        </motion.div>
      </form>

      <motion.div variants={childLoginVariants} className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-surface px-2 text-text-secondary font-semibold">or continue with</span>
        </div>
      </motion.div>

      <motion.div variants={childLoginVariants} className="flex justify-center w-full">
        <div id="googleSignInDiv" className="w-full h-[44px] flex justify-center"></div>
      </motion.div>

      <motion.div variants={childLoginVariants} className="text-center">
        <p className="text-xs text-text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-light hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
