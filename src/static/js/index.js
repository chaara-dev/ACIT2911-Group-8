import { addLogoutListener } from "./shared.js";
import { displaySubscription } from "./subscription-view.js";

const getSubscriptions = async () => {
  try {
    const res = await fetch(`/api/subscriptions`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data["error"]);
    }

    return data.subscriptions;
  } catch (error) {
    console.log(error);
  }
};

const calculateRenewalDays = (renewalDate) => {
  const difference = new Date(renewalDate) - new Date();
  return Math.ceil(difference / (24 * 60 * 60 * 1000));
};

const calculateNextRenewal = (subs) => {
  if (subs.length === 0) {
    return "N/A";
  }
  return calculateRenewalDays(subs[0]["renewal_date"]);
};

const calculateTotalCost = (subs) => {
  let total = 0;
  for (const sub of subs) {
    if (sub["billing_type"] === "Monthly") {
      total += sub["cost"];
    }
  }
  return total.toFixed(2);
};

const filterSubscriptions = (subs, billing_type) => {
  if (!billing_type) return subs;
  return subs.filter((sub) => sub.billing_type === billing_type);
};

const filterSubscriptionsByPrice = (subs) => {
  return subs.sort((a, b) => b.cost - a.cost);
};

const filterSubscriptionsByRenewalDate = (subs) => {
  return subs.sort((a, b) => b.renewal_date - a.renewal_date);
};

const filterSubscriptionsAlpha = (subs) => {
  return subs.sort((a, b) => a.name - b.name);
};

const searchSubscriptions = (subs, search) => {
  if (!search) return subs;
  const needle = search.toLowerCase();
  return subs.filter((sub) => String(sub.name).toLowerCase().includes(needle));
};

const displayDashboard = (subs) => {
  const activeSubsValue = document.getElementById("active-sub");
  activeSubsValue.textContent = subs.length;

  const nextRenewalValue = document.getElementById("next-renew");
  nextRenewalValue.textContent = calculateNextRenewal(subs);

  const totalCostValue = document.getElementById("total-price");
  totalCostValue.textContent = calculateTotalCost(subs);
};

const displaySubscriptions = (subs) => {
  const subCards = document.querySelector(".cards");
  subCards.replaceChildren();

  subs.forEach((sub) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.id = sub.id;

    const cost = document.createElement("span");
    cost.textContent = `$${sub.cost}`;
    card.appendChild(cost);

    const name = document.createElement("span");
    name.textContent = sub.name;
    card.appendChild(name);

    const renewal = document.createElement("span");
    const renewalDays = calculateRenewalDays(sub.renewal_date);
    renewal.textContent = `${renewalDays} days`;
    card.appendChild(renewal);

    card.addEventListener("click", async () => {
      displaySubscription(sub.id);
    });

    subCards.appendChild(card);
  });
};

let allSubscriptions = [];
let activeSearch = "";
let activeBillingFilter = "";
let activeSort = "";

const applySubscriptionView = () => {
  let shown = allSubscriptions.slice();
  shown = searchSubscriptions(shown, activeSearch);
  shown = filterSubscriptions(shown, activeBillingFilter);

  if (activeSort === "price") {
    shown = filterSubscriptionsByPrice(shown);
  } else if (activeSort === "date") {
    shown = filterSubscriptionsByRenewalDate(shown);
  } else if (activeSort === "name") {
    shown = filterSubscriptionsAlpha(shown);
  }

  displayDashboard(shown);
  displaySubscriptions(shown);
};

const main = async () => {
  addLogoutListener();

  try {
    const subs = await getSubscriptions();

    if (subs === undefined) {
      throw new Error("Could not get subscriptions");
    }

    allSubscriptions = subs;
    applySubscriptionView();

    const filterButton = document.getElementById("filter-button");
    const searchButton = document.getElementById("search-button");
    const sortButton = document.getElementById("sort-button");

    if (filterButton) {
      filterButton.addEventListener("click", () => {
        const filterOptions = document.querySelector(".filters");
        filterOptions.replaceChildren();

        const monthly = document.createElement("button");
        monthly.textContent = "Monthly";
        monthly.classList.add("monthly");
        filterOptions.appendChild(monthly);

        const yearly = document.createElement("button");
        yearly.textContent = "Yearly";
        yearly.classList.add("yearly");
        filterOptions.appendChild(yearly);

        const clearFilter = document.createElement("button");
        clearFilter.textContent = "X";
        clearFilter.classList.add("clear-button");
        filterOptions.appendChild(clearFilter);

        monthly.addEventListener("click", () => {
          const value = "Monthly";
          activeBillingFilter = value;
          applySubscriptionView();
        });

        yearly.addEventListener("click", () => {
          const value = "Yearly";
          activeBillingFilter = value;
          applySubscriptionView();
        });

        clearFilter.addEventListener("click", () => {
          activeBillingFilter = "";
          applySubscriptionView();
        });
      });
    }
    if (sortButton) {
      sortButton.addEventListener("click", () => {
        const filterOptions = document.querySelector(".filters");
        filterOptions.replaceChildren();

        const price = document.createElement("button");
        price.textContent = "Price";
        price.classList.add("price");
        filterOptions.appendChild(price);

        const renewalDate = document.createElement("button");
        renewalDate.textContent = "Renewal date";
        renewalDate.classList.add("renewal-date");
        filterOptions.appendChild(renewalDate);

        const name = document.createElement("button");
        name.textContent = "Name";
        name.classList.add("name");
        filterOptions.appendChild(name);

        const clearFilter = document.createElement("button");
        clearFilter.textContent = "X";
        clearFilter.classList.add("clear-button");
        filterOptions.appendChild(clearFilter);

        price.addEventListener("click", () => {
          activeSort = "price";
          applySubscriptionView();
        });

        renewalDate.addEventListener("click", () => {
          activeSort = "date";
          applySubscriptionView();
        });

        name.addEventListener("click", () => {
          activeSort = "name";
          applySubscriptionView();
        });

        clearFilter.addEventListener("click", () => {
          activeSort = "";
          applySubscriptionView();
        });
      });
    }

    searchButton.addEventListener("click", () => {
      if (document.querySelector(".search")) return;

      const searchBox = document.createElement("input");
      searchBox.type = "text";
      searchBox.classList.add("search");
      searchButton.appendChild(searchBox);

      searchBox.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          activeSearch = searchBox.value.trim();
          applySubscriptionView();
        }
      });
    });

    // if (filterButton) {
    //   filterButton.addEventListener("click", () => {
    //     const value = window.prompt(
    //       "Filter by billing type (Monthly, Yearly), or leave empty to show all:",
    //       activeBillingFilter,
    //     );
    //     if (value === null) return;
    //     activeBillingFilter = value.trim();
    //     applySubscriptionView();
    //   });
    // }

    // if (searchButton) {
    //   searchButton.addEventListener("click", () => {
    //     const value = window.prompt(
    //       "Search subscriptions by name, or leave empty to clear:",
    //       activeSearch,
    //     );
    //     if (value === null) return;
    //     activeSearch = value.trim();
    //     applySubscriptionView();
    //   });
    // }
  } catch (error) {
    console.log(error);
  }
};

main();
