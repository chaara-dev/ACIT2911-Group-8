const displayError = (errorMessage) => {
  const pageTitle = document.querySelector(".submitButtonDiv");

  if (!document.querySelector(".missing-fields-error")) {
    const error = document.createElement("p");
    error.textContent = errorMessage;
    error.classList.add("missing-fields-error");
    pageTitle.after(error);
  }
};

const createNewSubscription = () => {
  // Set date input limits
  const dateInput = document.getElementById("subscriptionDate");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  dateInput.min = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
  dateInput.max = `${nextYear.getFullYear()}-${String(nextYear.getMonth() + 1).padStart(2, "0")}-${String(nextYear.getDate()).padStart(2, "0")}`;
  
  const createSub = document.getElementById("submitButton");

  createSub.addEventListener("click", async () => {
    const subName = document.getElementById("subscriptionName").value;
    const subPrice = document.getElementById("subscriptionPrice").value;
    const subPeriod = document.getElementById("subscriptionPeriodSelect").value;
    const subRenewalDate = document.getElementById("subscriptionDate").value;

    if (!subName || !subPrice || !subPeriod || !subRenewalDate) {
      return displayError("All fields must be entered.");
    }
    // Validate renewal date is within limit
    const maxDate = new Date();
    if (subPeriod === "Monthly") {
      maxDate.setMonth(maxDate.getMonth() + 1);
    } else if (subPeriod === "Yearly") {
      maxDate.setFullYear(maxDate.getFullYear() + 1);
    }
    const maxDateString = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, "0")}-${String(maxDate.getDate()).padStart(2, "0")}`;

    if (subRenewalDate > maxDateString) {
      dateInput.value = "";
      if (subPeriod === "Monthly") {
        return displayError("Renewal date must be within a month from today.");
      } else {
        return displayError("Renewal date must be within a year from today.");
      }
    }

    const newSub = {
      name: subName,
      cost: parseFloat(subPrice),
      billing_type: subPeriod,
      renewal_date: subRenewalDate,
    };

    try {
      const res = await fetch(`/api/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSub),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data["error"]);
      }
      window.location.href = "/";
    } catch (error) {
      console.log(error);
    }
  });
};

createNewSubscription();
