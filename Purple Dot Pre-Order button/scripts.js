// Get a list of player names from product. If no names are available, use the global player names.
function getPlayerNames() {
  // Product-specific players names
  let metafields = Tapcart.variables.product.metafields;
  if (
    metafields.hasOwnProperty("customiser") &&
    metafields.customiser.hasOwnProperty("player_names")
  ) {
    let names = metafields.customiser.player_names;
    if (names && names.length && (names = names.split(/,\s?/)).length) {
      return names;
    }
  }

  // Global player names.
  return [
    "Dessers (9)",
    "Lammers (14)",
    "Balogun (27)",
    "Dowell (20)",
    "Danilo (99)",
    "Butland (1)",
    "Raskin (43)",
    "Cantwell (13)",
    "Tavernier (2)",
    "Lawrence (11)",
    "R.Matondo (17)",
    "Yilmaz (3)",
    "Goldson (6)",
    "Sima (19)",
    "Souttar (5)",
    "Sterling (21)",
  ];
}

/****************************
 Do not edit below this line.
 ****************************/

// Personalization

// Tapcart Variables
let selectedVariantId = Tapcart.variables.product.selectedVariant.id;
let tags = Tapcart.variables.product.tags;

// Tapcart Register Event Handler
Tapcart.registerEventHandler("product/updated", (data) => {
  selectedVariantId = data.product.selectedVariant.id;
});

//when tap on "Personalised Kit" show a modal of personalised options
const customiserBlock = jQuery(".customiser-block");

const dialog = customiserBlock.find(".dialog#customiser-row");
const dialogTitle = dialog.find("p#customiser-title");
const customiserOptions = customiserBlock.find(".customiser-options");
const customiserOptionButtons = customiserOptions.find(".customiser-button");
const customisationForm = dialog.find("form#customiser-form");
const dialogConfirmButton = customisationForm.find("button.confirm");
const dialogCloseButton = customisationForm.find("button.close");
const summary = customiserOptions.find(".summary");
const customisationInput = customisationForm.find(".diy-product input");

//Populate player select drop-down list.
const playerSelect = customisationForm.find(".player-select select");

function populatePlayersList() {
  //already run - ignore.
  if (playerSelect.find("option").length == 1) {
    let playersList = getPlayerNames(),
      options = [];
    playersList.forEach(function (player) {
      let results = player.match(/(.*) \((\d+)\)/),
        match = results[0],
        name = results[1],
        number = results[2];
      options.push(
        '<option data-name="' +
          name +
          '" data-number="' +
          number +
          '">' +
          match +
          "</option>"
      );
    });
    playerSelect.append(options.join(""));
  }
}

function showHidePersonalisedProduct() {
  customiserBlock.find("#customisation-buttons input:checked");

  //Hide personalisation options by default
  customiserOptions.removeClass("show");

  //Is this the button to trigger the personalisation?
  if (
    customiserBlock
      .find("#customisation-buttons input:checked")
      .next()
      .hasClass("personalised-product")
  ) {
    customiserOptions.addClass("show");
  }
}

function showHidePersonalisationOptions(target) {
  populatePlayersList();
  //Up front, remove active class from both buttons:
  customiserOptionButtons.removeClass("active");

  //Disable modal "confirm selection" button
  resetForm();

  //Hide both style options
  dialog.find("#customiser-form div").hide();

  //Are we on the div?
  target = jQuery(target);
  target.addClass("active");

  ["diy-product", "hero-product"].forEach((productType) =>
    target.hasClass(productType)
      ? dialog.find("#customiser-form div." + productType).show()
      : false
  );
  dialogTitle.textContent = target.find(".name").textContent;
  dialog.addClass("show");
}

// Restrict personalised Name to alphabetical characters only.
customisationInput
  .filter((i, input) => input.name == "name")
  .on("input", function (e) {
    let val = this.value;
    val = val.toUpperCase().replace(/[^A-Z]+/g, "");
    this.value = val;
    showdialogConfirmButton();
  });

// Restrict personalised Number to numbers only. Restrict to 2 characters.
customisationInput
  .filter((i, input) => input.name == "number")
  .on("input", function (e) {
    let val = this.value;
    val = val.replace(/[^0-9]+/g, "").substr(-2);
    this.value = val;
    showdialogConfirmButton();
  });

function showdialogConfirmButton() {
  dialogConfirmButton.attr("disabled", true);
  if (
    (customisationForm.find('.diy-product input[name="number"]').val().length &&
      customisationForm.find('.diy-product input[name="name"]').val().length) ||
    playerSelect.val().length
  ) {
    dialogConfirmButton.attr("disabled", false);
  }
}

dialogConfirmButton.on("click", function (e) {
  e.preventDefault();
  //Are we getting name/number from diy or hero?
  let butt = customiserOptionButtons.filter((i, input) =>
    input.classList.contains("active")
  );
  let name, number;
  switch (butt.hasClass("diy-product")) {
    case true:
      //DIY
      name = customisationInput
        .filter((i, input) => input.name == "name")
        .val();
      number = customisationInput
        .filter((i, input) => input.name == "number")
        .val();
      break;
    case false:
      //HERO
      let option = playerSelect.find(":selected");
      name = option.data("name");
      number = option.data("number");
      break;
  }

  summary.find(".name .value").text(name.toUpperCase());
  summary.find(".number .value").text(number);
  summary.show();
  dialog.removeClass("show");
});

dialogCloseButton.on("click", function (e) {
  e.preventDefault();
  resetForm();
  customiserOptionButtons.removeClass("active");
  dialog.removeClass("show");
});

function resetForm() {
  dialogConfirmButton.attr("disabled", true);
  playerSelect.val("");
  customisationInput.val("");
  summary.find(".name .value").text("");
  summary.find(".number .value").text("");
  summary.hide();
}

// Add to Cart Function
function addToCart() {
  let addToCart = jQuery(".add-to-cart");

  let lineItem = [
    {
      quantity: 1,
      variantId: selectedVariantId,
    },
  ];

  //is this Standard or Personalised product?
  if (
    customiserBlock.find("#customisation-buttons input:checked").val() ==
    "Personalised"
  ) {
    if (
      summary.find(".name .value").text().length === 0 ||
      summary.find(".number .value").text() === 0
    ) {
      Tapcart.actions.showToast({
        message: "Missing personalisation options.",
        type: "error", // "success" || "error"
      });
      return;
    }

    let heroOrCustom = "custom";
    if (customiserOptionButtons.filter(".active").hasClass("hero-product")) {
      heroOrCustom = "hero";
    }
    lineItem[0].attributes = [
      {
        key: "_name",
        value: summary.find(".name .value").text(),
      },
      {
        key: "Name",
        value: summary.find(".name .value").text(),
      },
      {
        key: "_number",
        value: summary.find(".number .value").text(),
      },
      {
        key: "Number",
        value: summary.find(".number .value").text(),
      },
      {
        key: "_hero_or_custom",
        value: heroOrCustom,
      },
    ];

    //Add item personalisation fee
    lineItem.push({
      quantity: 1,
      variantId: 34728327446694,
      productId: 5347243229350,
    });
  }

  //Add to cart
  Tapcart.actions.addToCart({
    lineItems: lineItem,
  });
  addToCart.text("Added!");
  addToCart.attr("disabled", true);
  Tapcart.actions.showToast({
    message: "Product Successfully Added",
    type: "success", // "success" || "error"
  });
  setTimeout(() => {
    addToCart.text("Add to cart");
    addToCart.attr("disabled", false);
  }, 2000);
}

// Purple Dot

let selectedVariant = Tapcart.variables.product.selectedVariant.id;
let currency = Tapcart.variables.cart.currency;
const onlyAllowCurrencies = [];

const apiKey = "<YOUR_API_KEY>";

let releaseId = "";

wrapWithErrorTracking(() => {
  const customiserBlock = jQuery(".customiser-block");
  const addToCartContainer = jQuery(".add-to-cart-container");
  const purpleDotContainer = jQuery(".pd-button-container");

  const instockButton = jQuery("#in-stock-button");
  const preorderButton = jQuery("#preorder-button");
  const soldOutButton = jQuery("#sold-out-button");

  const dispatchDateDiv = jQuery("#waitlist-dispatch-date");
  const waitlistInfoDiv = jQuery("#waitlist-info");
  const learnMoreLink = jQuery("#learn-more-link");

  learnMoreLink.on("click", () => {
    Tapcart.actions.openScreen({
      destination: {
        type: "web",
        url: `https://www.purpledotprice.com/embedded-checkout/pre-order-value-prop?hideBackToProduct=true&isAddToPreorder=false&apiKey=${apiKey}&noModal=true&salesChannel=tapcart`,
      },
    });
  });

  preorderButton.on("click", () => {
    Tapcart.actions.openScreen({
      destination: {
        type: "web",
        url: `https://www.purpledotprice.com/embedded-checkout/pre-order-checkout?apiKey=${apiKey}&variantId=${selectedVariant}&releaseId=${releaseId}&currency=${currency}&noModal=true&salesChannel=tapcart`,
      },
    });
  });

  instockButton.on("click", () => {
    Tapcart.actions.addToCart({
      lineItems: [
        {
          variantId: selectedVariant,
          quantity: 1,
        },
      ],
    });
  });

  async function getPreorderStateForVariant(selectedVariant) {
    const url = new URL(
      "https://www.purpledotprice.com/api/v1/variants/preorder-state"
    );
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("variant_id", selectedVariant);

    const resp = await fetch(url.toString());

    const data = await resp.json();

    if (resp.ok) {
      return {
        state: data.data.state,
        dispatchDate: data.data.waitlist.display_dispatch_date,
        releaseId: data.data.waitlist.id,
      };
    } else {
      void captureError({
        message: `Failed to fetch preorder state for variant ${selectedVariant}`,
      });

      return {
        state: "SOLD_OUT",
      };
    }
  }

  async function updatePreorderButtonForSelectedVariant(newSelectedVariant) {
    selectedVariant = newSelectedVariant;

    const data = await getPreorderStateForVariant(selectedVariant);

    let state = data.state;

    if (onlyAllowCurrencies.length && state === "ON_PREORDER") {
      state =
        data.state === !onlyAllowCurrencies.includes(currency)
          ? "SOLD_OUT"
          : state;
    }

    const dispatchDate = data.dispatchDate;

    releaseId = data.releaseId ?? "";

    if (state === "SOLD_OUT") {
      purpleDotContainer.show();
      customiserBlock.hide();
      addToCartContainer.hide();

      soldOutButton.show();
      instockButton.hide();
      preorderButton.hide();

      dispatchDateDiv.html("");
      waitlistInfoDiv.hide();
    } else if (state === "ON_PREORDER") {
      purpleDotContainer.show();

      // Prevent personalization even if possible when item is on pre-order
      resetForm();
      customiserBlock.hide();
      addToCartContainer.hide();

      preorderButton.show();
      soldOutButton.hide();
      instockButton.hide();

      dispatchDateDiv.html(dispatchDate);
      waitlistInfoDiv.show();
    } else if (state === "AVAILABLE_IN_STOCK") {
      if (tags.includes("tapcart_personalisation")) {
        customiserBlock.show();
        addToCartContainer.show();
        purpleDotContainer.hide();

        dispatchDateDiv.html("");
        waitlistInfoDiv.hide();
      } else {
        purpleDotContainer.show();
        customiserBlock.hide();
        addToCartContainer.hide();

        instockButton.show();
        preorderButton.hide();
        soldOutButton.hide();

        dispatchDateDiv.html("");
        waitlistInfoDiv.hide();
      }
    }
  }

  if (tags.includes("purple-dot-has-variant-on-preorder")) {
    updatePreorderButtonForSelectedVariant(
      Tapcart.variables.product.selectedVariant.id
    );

    Tapcart.registerEventHandler("product/updated", async (eventData) => {
      await updatePreorderButtonForSelectedVariant(
        eventData.product.selectedVariant.id
      );
    });
  } else {
    if (tags.includes("tapcart_personalisation")) {
      // Show personalization buttons
      customiserBlock.show();
      addToCartContainer.show();
      purpleDotContainer.hide();
    } else {
      // Show in-stock button
      customiserBlock.hide();
      addToCartContainer.show();
      purpleDotContainer.hide();
    }
  }

  purpleDotContainer.show();
});

window.addEventListener("unhandledrejection", async (event) => {
  await captureError(event.reason);
});

async function wrapWithErrorTracking(fn) {
  try {
    fn();
  } catch (e) {
    await captureError(e);
  }
}

async function captureError(error) {
  try {
    const url = new URL(`https://www.purpledotprice.com/api/v1/error`);

    url.searchParams.set("api_key", apiKey);

    const body = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      href: window.location.href,
      referrer: window.document.referrer,
      salesChannel: "tapcart",
    };

    void fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch (err) {
    console.error("Error while trying to log an error!", err.message);
  }
}
