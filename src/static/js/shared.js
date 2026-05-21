export const addLogoutListener = () => {
  const logoutButton = document.querySelector(".account");

  logoutButton.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      window.location.href = "/login";
    } catch (error) {
      console.log(error);
    }
  });
};

export const resetSubscriptionDialog = () => {
  document.getElementById("subNameEdit").hidden = true;
  document.getElementById("subPriceEdit").hidden = true;
  document.getElementById("subPeriodEdit").hidden = true;
  document.getElementById("subRenewalDateEdit").hidden = true;
  document.getElementById("subscribedOnDateEdit").hidden = true;
  document.getElementById("saveEditButtonDiv").hidden = true;
  document.getElementById("cancelEditButtonDiv").hidden = true;

  document.getElementById("subPrice").hidden = false;
  document.getElementById("subPeriod").hidden = false;
  document.getElementById("subRenewalDate").hidden = false;
  document.getElementById("subscribedOn").hidden = false;
  document.getElementById("editSubButtonDiv").hidden = false;
  document.querySelector(".sub-total-paid").hidden = false;
  document.querySelector(".sub-payments").hidden = false;
};
