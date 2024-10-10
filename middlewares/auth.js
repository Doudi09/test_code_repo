const jwt = require("jsonwebtoken");

exports.checkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    //verify if the token exists :
    if (!authHeader?.startsWith("Bearer ")) {
      // no token available
      return res.status(403).json({ message: "No token provided" });
    }

    const accessToken = authHeader.split(" ")[1];
    console.log("the access token is " + accessToken);
    //decoding the access token
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err && err.name == "TokenExpiredError") {
        return res.status(403).json({ message: "Token expired" });
      } else if (err) {
        console.error("Error chackAuth middleware", err.message);
        return res.status(403).json({ message: "Invalid token" });
      }

      //attashing the user id
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      req.token = accessToken;
      next();
    });
  } catch (error) {
    console.error("Error chackAuth middleware", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.checkRoleAccess = (...roles) => {
  return (req, res, next) => {
    //
    console.log("the role access is : ", roles);
    console.log("the user roles are ", req.user);
    //
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    return next();
  };
};
