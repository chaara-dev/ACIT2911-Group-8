const displayError = (errorMessage) => {
  const signupButton = document.querySelector("button");

  if (!document.querySelector(".signup-error")) {
    const error = document.createElement("p");
    error.textContent = errorMessage;
    error.classList.add("signup-error"); // edit this class in signup.css
    signupButton.after(error);
  }
};

const createNewAccount = () => {
  const signupButton = document.querySelector("button");

  signupButton.addEventListener("click", async () => {
    const email = document.querySelector(`[type="email"]`).value;
    const password = document.querySelector(`[type="password"]`).value;

    if (!email || !password) {
      return displayError("Missing email or password");
    }

    const newAccount = { email: email, password: password };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccount),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data["error"]);
      }
      window.location.href = "/login";
    } catch (error) {
      console.log(error);
      return displayError(error);
    }
  });
};

const main = () => {
  createNewAccount();
};

main();
