import { addLogoutListener } from "./shared.js";

const displayError = (errorMessage) => {
  const pageTitle = document.querySelector(".submitButtonDiv");

  if (!document.querySelector(".missing-fields-error")) {
    const error = document.createElement("p");
    error.textContent = errorMessage;
    error.classList.add("missing-fields-error");
    pageTitle.after(error);
  }
};

const displaySubDropdown = async () => {
  try {
    const res = await fetch("/static/data/subscription_services.json");
    const subscriptions = await res.json();

    const subName = document.getElementById("subscriptionName");
    const dropdown = document.getElementById("subscriptionDropdown");

    const filterDropdown = (filter = "") => {
      const filtered = subscriptions.filter((sub) =>
        sub["name"].toLowerCase().includes(filter.toLowerCase()),
      );
      dropdown.replaceChildren();
      if (filtered.length === 0) {
        dropdown.style.display = "none";
        return;
      }
      filtered.forEach((sub) => {
        const li = document.createElement("li");
        li.textContent = sub["name"];
        li.addEventListener("click", () => {
          subName.value = sub["name"];
          dropdown.style.display = "none";
        });
        dropdown.appendChild(li);
      });
      dropdown.style.display = "block";
    };

    subName.addEventListener("focus", () => filterDropdown(subName.value));
    subName.addEventListener("input", () => filterDropdown(subName.value));

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".dropdown-wrapper")) {
        dropdown.style.display = "none";
      }
    });
  } catch (error) {
    console.log(error);
  }
};


// Set date input limits
const setDateInputLimits = () => {
  const dateInput = document.getElementById("subscriptionDate");
 const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  dateInput.min = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
  dateInput.max = `${nextYear.getFullYear()}-${String(nextYear.getMonth() + 1).padStart(2, "0")}-${String(nextYear.getDate()).padStart(2, "0")}`;
};

const checkRenewalDateValid = (subPeriod, renewalDate) => {
  const dateInput = document.getElementById("subscriptionDate");
 
  // Validate renewal date is within limit
  const maxDate = new Date();
  if (subPeriod === "Monthly") {
    maxDate.setMonth(maxDate.getMonth() + 1);
  } else if (subPeriod === "Yearly") {
    maxDate.setFullYear(maxDate.getFullYear() + 1);
  }
  const maxDateString = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, "0")}-${String(maxDate.getDate()).padStart(2, "0")}`;

  if (renewalDate > maxDateString) {
    dateInput.value = "";
    if (subPeriod === "Monthly") {
      displayError("Renewal date must be within a month from today.");
      return false;
    } else {
      displayError("Renewal date must be within a year from today.");
      return false;
    }
  }
  return true;
};

const createNewSubscription = () => {
  const createSub = document.getElementById("submitButton");

  createSub.addEventListener("click", async () => {
    const subName = document.getElementById("subscriptionName").value;
    const subPrice = document.getElementById("subscriptionPrice").value;
    const subPeriod = document.getElementById("subscriptionPeriodSelect").value;
    const subRenewalDate = document.getElementById("subscriptionDate").value;

    if (!subName || !subPrice || !subPeriod || !subRenewalDate) {
      return displayError("All fields must be entered.");
    }

    if (parseFloat(subPrice) < 0) {
      return displayError("Price cannot be less than $0.");
    }

    if (!checkRenewalDateValid(subPeriod, subRenewalDate)) {
      return;
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
        throw new Error(data.error);
      }

      window.location.href = "/";
    } catch (error) {
      console.log(error);
    }
  });
};

const main = async () => {
  addLogoutListener();
  await displaySubDropdown();
  setDateInputLimits();
  createNewSubscription();
};

main();
