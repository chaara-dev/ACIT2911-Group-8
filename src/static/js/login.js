const displayError = (errorMessage) => {
  const loginButton = document.getElementById("loginButton");

  if (!document.querySelector(".login-error")) {
    const error = document.createElement("p");
    error.textContent = errorMessage;
    error.classList.add("login-error"); // edit this class in signup.css
    loginButton.after(error);
  }
};

const login = () => {
  const loginButton = document.getElementById("loginButton");

  loginButton.addEventListener("click", async () => {
    const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;

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
