import React from "react";
import { useState, useEffect } from "react";
import { auth } from "../../firebase"; //firebase auth
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { createOrUpdateUser } from "../../Functions/auth";

const RegisterComplete = ({ history }) => {
  //as in index.js all the components are in BrowserRouter hence we can get the browser props in any components u can access it as props.history or destructure it as {history}
  // history is used to push the user to any page
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //const {user} =useSelector((state)=>({...state})); // taking the user info from redux

  let dispatch = useDispatch();
  useEffect(() => {
    setEmail(window.localStorage.getItem("emailForRegistration"));
  }, [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    //validation
    if (!email || !password) {
      toast.error("Email and password is required.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      const result = await auth.signInWithEmailLink(
        email,
        window.location.href // this is the full url of this page
      );
      //console.log(result);
      if (result.user.emailVerified) {
        window.localStorage.removeItem("emailForRegistration"); //remove email from local storage
        //get userid token for further use for backend
        let user = auth.currentUser; // getting the current user
        await user.updatePassword(password);
        const idTokenResult = await user.getIdTokenResult();
        //redux store

        createOrUpdateUser(idTokenResult.token)
          .then((res) => {
            dispatch({
              type: "LOGGED_IN_USER",
              payload: {
                name: res.data.name,
                email: res.data.email,
                token: idTokenResult.token,
                role: res.data.role,
                _id: res.data._id,
              },
            });
          })
          .catch((err) => console.log(err));

        //redirect
        history.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message); //for displaying the error
    }
  };

  const completeRegistrationForm = () => (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        className="form-control"
        value={email}
        disabled
      ></input>
      <input
        type="password"
        className="form-control"
        value={password}
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      ></input>
      <br />
      <button type="submit" className="btn btn-raised">
        Complete registration
      </button>
    </form>
  );
  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <h4>Register Complete</h4>
          {completeRegistrationForm()}
        </div>
      </div>
    </div>
  );
};

export default RegisterComplete;
