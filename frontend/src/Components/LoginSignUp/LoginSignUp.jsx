import React, { useState } from 'react';
import './LoginSignUp.css';

export const LoginSignUp = () => {
  const [action, setAction] = useState("Sign Up");

  return (
    <div className='container'>
      <div className="header">
        <div className="text">{action}</div>
      </div>
      <div className="inputs">
        {action === "Sign Up" && (
          <>
            <div className="input">
              <input type="text" placeholder="Name" />
            </div>
            <div className="input">
              <input type="text" placeholder="Username" pattern="[A-Za-z0-9]+" />
            </div>
            <div className="input">
              <input type="email" placeholder="Email" />
            </div>
            <div className="input">
              <input type="password" placeholder="Password" />
            </div>
            <div className="input">
              <input type="password" placeholder="Confirm Password" />
            </div>
            <div className="input">
              <input type="tel" placeholder="Phone Number" />
            </div>
          </>
        )}
        {action === "Login" && (
          <>
            <div className="input">
              <input type="email" placeholder="Email" />
            </div>
            <div className="input">
              <input type="password" placeholder="Password" />
            </div>
          </>
        )}
      </div>
      {action === "Sign Up" ? null : (
        <div className="forgot-password">Lost Password? <span>Click Here!</span></div>
      )}
      <div className="submit-container">
        <div className={action === "Login" ? "submit gray" : "submit"} onClick={() => { setAction("Sign Up") }}>Sign Up</div>
        <div className={action === "Sign Up" ? "submit gray" : "submit"} onClick={() => { setAction("Login") }}>Login</div>
      </div>
    </div>
  );
}