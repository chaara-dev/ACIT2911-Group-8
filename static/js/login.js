const displayError = (errorMessage) => {
  const signupButton = document.getElementById("signup-button");

  if (!document.querySelector(".login-error")) {
    const error = document.createElement("p");
    error.textContent = errorMessage;
    error.classList.add("login-error"); // edit this class in signup.css
    signupButton.after(error);
  }
};

const login = () => {
  const loginButton = document.getElementById("login-button");

  loginButton.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const userAccount = { email: email, password: password };

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userAccount),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data["error"]);
      }
      window.location.href = "/";
    } catch (error) {
      console.log(error);
      return displayError(error.message);
    }
  });
};

const main = () => {
  login();
};

main();
