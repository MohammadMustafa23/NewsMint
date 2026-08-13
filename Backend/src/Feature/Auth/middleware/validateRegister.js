const validateRegister = (req, res, next) => {
  const { userName, email, password, confirmPassword,acceptTerms } = req.body;
  
  // Check required fields
  if (!userName || !email || !password || !confirmPassword || !acceptTerms) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  // Terms 
  if(!acceptTerms) {
    return res.status(400).json({
      success : false,
      message : "Please accept Terms ans Condition"
    });
  }

  // Username
  if (userName.trim().length < 3 || userName.trim().length > 30) {
    return res.status(400).json({
      success: false,
      message: "Username must be between 3 and 30 characters.",
    });
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email address.",
    });
  }

  // Password
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters.",
    });
  }

  // Confirm Password
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match.",
    });
  }


  next();
};

export { validateRegister };
