export const addLogoutListener = () => {
  const logoutButton = document.querySelector(".account");
  if (!logoutButton) {
    return;
  }

  logoutButton.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data["error"]);
      }

      window.location.href = "/login";
    } catch (error) {
      console.log(error);
    }
  });
};
