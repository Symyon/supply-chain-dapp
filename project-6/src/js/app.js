App = {
  web3Provider: null,
  contracts: {},
  emptyAddress: "0x0000000000000000000000000000000000000000",
  upc: 0,
  metamaskAccountID: "0x0000000000000000000000000000000000000000",
  ownerID: "0x0000000000000000000000000000000000000000",
  originFarmName: null,
  originFarmInformation: null,
  originFarmLatitude: null,
  originFarmLongitude: null,
  productNotes: null,

  init: async function () {
    App.readForm();
    /// Setup access to blockchain
    return await App.initWeb3();
  },

  readForm: function () {
    App.upc = $("#upc").val();
    App.ownerID = $("#ownerID").val();
    App.originFarmName = $("#origin-farm-name").val();
    App.originFarmInformation = $("#origin-farm-information").val();
    App.originFarmLatitude = $("#origin-farm-latitude").val();
    App.originFarmLongitude = $("#origin-farm-longitude").val();
    App.productNotes = $("#product-notes").val();

    console.log(
      App.upc,
      App.ownerID,
      App.originFarmName,
      App.originFarmInformation,
      App.originFarmLatitude,
      App.originFarmLongitude,
      App.productNotes
    );
  },

  initWeb3: async function () {
    /// Find or Inject Web3 Provider
    /// Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }

    App.getMetaskAccountID();

    return App.initSupplyChain();
  },

  getMetaskAccountID: function () {
    web3 = new Web3(App.web3Provider);

    // Retrieving accounts
    web3.eth.getAccounts(function (err, res) {
      if (err) {
        console.log("Error:", err);
        return;
      }
      console.log("getMetaskID:", res);
      App.metamaskAccountID = res[0];
      const activeIDNodes = document.querySelectorAll("#active-id");
      activeIDNodes.forEach(function (node) {
        node.value = res[0];
      });
    });
  },

  initSupplyChain: function () {
    web3.eth.defaultAccount = web3.eth.accounts[0];
    /// Source the truffle compiled smart contracts
    var jsonSupplyChain = "../../build/contracts/SupplyChain.json";

    /// JSONfy the smart contracts
    $.getJSON(jsonSupplyChain, function (data) {
      console.log("data", data);
      var SupplyChainArtifact = data;
      App.contracts.SupplyChain = TruffleContract(SupplyChainArtifact);
      App.contracts.SupplyChain.setProvider(App.web3Provider);

      App.fetchItemBufferOne();
      App.fetchItemBufferTwo();
      App.fetchEvents();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on("click", App.handleButtonClick);
    document
      .querySelector("#check-id")
      .addEventListener("input", function (evt) {
        document.querySelector("#is-farmer").textContent = "";
        document.querySelector("#is-not-farmer").textContent = "";
        document.querySelector("#is-distributor").textContent = "";
        document.querySelector("#is-not-distributor").textContent = "";
        document.querySelector("#is-retailer").textContent = "";
        document.querySelector("#is-not-retailer").textContent = "";
        document.querySelector("#is-consumer").textContent = "";
        document.querySelector("#is-not-consumer").textContent = "";
      });
  },

  setOwnerID: function (value) {
    console.log();
  },

  clearErrors: function () {
    document.querySelector("#harvest-error").style.display = "none";
    document.querySelector("#process-error").style.display = "none";
    document.querySelector("#sell-error").style.display = "none";
    document.querySelector("#buy-error").style.display = "none";
    document.querySelector("#receive-error").style.display = "none";
  },

  handleButtonClick: async function (event) {
    event.preventDefault();

    App.getMetaskAccountID();

    var processId = parseInt($(event.target).data("id"));
    console.log("processId", processId);

    App.clearErrors();

    switch (processId) {
      case 1:
        return await App.harvestItem(event);
        break;
      case 2:
        return await App.processItem(event);
        break;
      case 3:
        return await App.packItem(event);
        break;
      case 4:
        return await App.sellItem(event);
        break;
      case 5:
        return await App.buyItem(event);
        break;
      case 6:
        return await App.shipItem(event);
        break;
      case 7:
        return await App.receiveItem(event);
        break;
      case 8:
        return await App.purchaseItem(event);
        break;
      case 9:
        return await App.fetchItem(event);
        break;
      case 10:
        return await App.isFarmer(event);
        break;
      case 11:
        return await App.addFarmer(event);
        break;
      case 12:
        return await App.isDistributor(event);
        break;
      case 13:
        return await App.addDistributor(event);
        break;
      case 14:
        return await App.isRetailer(event);
        break;
      case 15:
        return await App.addRetailer(event);
        break;
      case 16:
        return await App.isConsumer(event);
        break;
      case 17:
        return await App.addConsumer(event);
        break;
    }
  },

  harvestItem: function (event) {
    event.preventDefault();

    function showError(error) {
      const errorNode = document.querySelector("#harvest-error");
      errorNode.style.display = "block";
      errorNode.textContent = error;
    }

    App.readForm();
    if (
      !App.upc ||
      !App.metamaskAccountID ||
      !App.originFarmName ||
      !App.originFarmInformation ||
      !App.originFarmLatitude ||
      !App.originFarmLongitude ||
      !App.productNotes
    ) {
      showError("Please fill in all fields");
      return;
    }
    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        return instance.harvestItem(
          App.upc,
          App.metamaskAccountID,
          App.originFarmName,
          App.originFarmInformation,
          App.originFarmLatitude,
          App.originFarmLongitude,
          App.productNotes,
          {
            from: App.metamaskAccountID,
          }
        );
      })
      .then(function (result) {
        $("#ftc-item").text(result);
        console.log("harvestItem", result);
        return instance.fetchItemBufferOne(App.upc);
      })
      .catch(function (err) {
        showError(err.message);
        console.log(err.message);
      });
  },

  processItem: function (event) {
    event.preventDefault();

    function showError(error) {
      const errorNode = document.querySelector("#process-error");
      errorNode.style.display = "block";
      errorNode.textContent = error;
    }

    const processUpc = $("#process-upc").val();
    if (!processUpc) {
      showError("Please fill in UPC");
      return;
    }

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        return instance.processItem(processUpc, {
          from: App.metamaskAccountID,
        });
      })
      .then(function (result) {
        $("#ftc-item").text(result);
        console.log("processItem", result);
      })
      .catch(function (err) {
        showError(err.message);
        console.log(err.message);
      });
  },

  packItem: function (event) {
    event.preventDefault();
    function showError(error) {
      const errorNode = document.querySelector("#process-error");
      errorNode.style.display = "block";
      errorNode.textContent = error;
    }

    const processUpc = $("#process-upc").val();
    if (!processUpc) {
      showError("Please fill in UPC");
      return;
    }

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        return instance.packItem(processUpc, { from: App.metamaskAccountID });
      })
      .then(function (result) {
        $("#ftc-item").text(result);
        console.log("packItem", result);
      })
      .catch(function (err) {
        showError(err.message);
        console.log(err.message);
      });
  },

  sellItem: function (event) {
    event.preventDefault();
    function showError(error) {
      const errorNode = document.querySelector("#sell-error");
      errorNode.style.display = "block";
      errorNode.textContent = error;
    }

    const sellUpc = $("#sell-upc").val();
    const sellPrice = $("#sell-price").val();

    if (!sellUpc || !sellPrice) {
      showError("Please fill in all fields");
      return;
    }

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const productPrice = web3.toWei(sellPrice, "ether");
        return instance.sellItem(sellUpc, productPrice, {
          from: App.metamaskAccountID,
        });
      })
      .then(function (result) {
        $("#ftc-item").text(result);
        console.log("sellItem", result);
      })
      .catch(function (err) {
        showError(err.message);
        console.log(err.message);
      });
  },

  buyItem: function (event) {
    event.preventDefault();
    function showError(error) {
      const errorNode = document.querySelector("#buy-error");
      errorNode.style.display = "block";
      errorNode.textContent = error;
    }

    const buyUpc = $("#buy-upc").val();
    if (!buyUpc) {
      showError("Please fill in UPC");
      return;
    }
    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        return instance.fetchItemBufferTwo.call(buyUpc);
      })
      .then(function (result) {
        console.log("itemData", result);
        const price = result[4];

        App.contracts.SupplyChain.deployed()
          .then(function (instance) {
            return instance.buyItem(buyUpc, {
              from: App.metamaskAccountID,
              value: price,
            });
          })
          .then(function (result) {
            $("#ftc-item").text(result);
            console.log("buyItem", result);
          })
          .catch(function (err) {
            showError(err.message);
            console.log(err.message);
          });
      })
      .catch(function (err) {
        showError(err.message);
        console.log(err.message);
      });
  },

  shipItem: function (event) {
    event.preventDefault();
    function showError(error) {
      const errorNode = document.querySelector("#buy-error");
      errorNode.style.display = "block";
      errorNode.textContent = error;
    }

    const buyUpc = $("#buy-upc").val();
    if (!buyUpc) {
      showError("Please fill in UPC");
      return;
    }
    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        return instance.shipItem(buyUpc, { from: App.metamaskAccountID });
      })
      .then(function (result) {
        $("#ftc-item").text(result);
        console.log("shipItem", result);
      })
      .catch(function (err) {
        showError(err.message);
        console.log(err.message);
      });
  },

  receiveItem: function (event) {
    event.preventDefault();
    function showError(error) {
      const errorNode = document.querySelector("#receive-error");
      errorNode.style.display = "block";
      errorNode.textContent = error;
    }

    const receiveUpc = $("#receive-upc").val();
    if (!receiveUpc) {
      showError("Please fill in UPC");
      return;
    }
    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        return instance.receiveItem(receiveUpc, { from: App.metamaskAccountID });
      })
      .then(function (result) {
        $("#ftc-item").text(result);
        console.log("receiveItem", result);
      })
      .catch(function (err) {
        showError(err.message);
        console.log(err.message);
      });
  },

  purchaseItem: function (event) {
    event.preventDefault();
    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const buyUpc = $("#buy-upc").val();
        return instance.purchaseItem(buyUpc, { from: App.metamaskAccountID });
      })
      .then(function (result) {
        $("#ftc-item").text(result);
        console.log("purchaseItem", result);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  fetchItemBufferOne: function (upc) {
    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        return instance.fetchItemBufferOne(upc);
      })
      .then(function (result) {
        document.querySelector("#result-upc").value = result[0];
        document.querySelector("#result-sku").value = result[1];
        document.querySelector("#result-owner-id").value = result[2];
        document.querySelector("#result-farmer-id").value = result[3];
        document.querySelector("#result-farmer-name").value = result[4];
        document.querySelector("#result-farm-info").value = result[5];
        document.querySelector("#result-farm-lat").value = result[6];
        document.querySelector("#result-farm-long").value = result[7];
        console.log("fetchItemBufferOne", JSON.stringify(result));
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  fetchItemBufferTwo: function (upc) {
    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        return instance.fetchItemBufferTwo.call(upc);
      })
      .then(function (result) {
        document.querySelector("#result-product-id").value = result[2];
        document.querySelector("#result-product-notes").value = result[3];
        document.querySelector("#result-product-price").value = web3.fromWei(
          result[4],
          "ether"
        );
        function getState(state) {
          switch (state) {
            case 0:
              return "Harvested";
            case 1:
              return "Processed";
            case 2:
              return "Packed";
            case 3:
              return "ForSale";
            case 4:
              return "Sold";
            case 5:
              return "Shipped";
            case 6:
              return "Received";
            case 7:
              return "Purchased";
            default:
              return "No State";
          }
        }
        document.querySelector("#result-item-state").value = getState(
          Number(result[5])
        );
        document.querySelector("#result-distributor-id").value = result[6];
        document.querySelector("#result-retailer-id").value = result[7];
        document.querySelector("#result-consumer-id").value = result[8];
        console.log("fetchItemBufferTwo", result);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  fetchItem: function (event) {
    let upc = $("#overview-upc").val();
    App.fetchItemBufferOne(upc);
    App.fetchItemBufferTwo(upc);
  },

  fetchPrice: function (upc) {
    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        return instance.fetchItemBufferTwo.call(upc);
      })
      .then(function (result) {
        const price = result[4];
        console.log("item price", price);
        return price;
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  isFarmer: function (event) {
    event.preventDefault();
    var processId = parseInt($(event.target).data("id"));

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const checkAccount = document.querySelector("#check-id").value;
        return instance.isFarmer(checkAccount);
      })
      .then(function (result) {
        if (result) {
          document.querySelector("#is-farmer").textContent = "is Farmer";
          document.querySelector("#is-not-farmer").textContent = "";
        } else {
          document.querySelector("#is-farmer").textContent = "";
          document.querySelector("#is-not-farmer").textContent = "is no Farmer";
        }

        $("#ftc-item").text(result);
        console.log("isFarmer", result);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  addFarmer: function (event) {
    event.preventDefault();
    var processId = parseInt($(event.target).data("id"));

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const checkAccount = document.querySelector("#check-id").value;
        return instance.addFarmer(checkAccount);
      })
      .then(function (result) {
        $("#ftc-item").text(result);
        console.log("addFarmer", result);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  isDistributor: function (event) {
    event.preventDefault();
    var processId = parseInt($(event.target).data("id"));

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const checkAccount = document.querySelector("#check-id").value;
        return instance.isDistributor(checkAccount);
      })
      .then(function (result) {
        if (result) {
          document.querySelector("#is-distributor").textContent =
            "is Distributor";
          document.querySelector("#is-not-distributor").textContent = "";
        } else {
          document.querySelector("#is-distributor").textContent = "";
          document.querySelector("#is-not-distributor").textContent =
            "is no Distributor";
        }
        $("#ftc-item").text(result);
        console.log("isDistributor", result);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  addDistributor: function (event) {
    event.preventDefault();
    var processId = parseInt($(event.target).data("id"));

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const checkAccount = document.querySelector("#check-id").value;
        return instance.addDistributor(checkAccount);
      })
      .then(function (result) {
        $("#ftc-item").text(result);
        console.log("addDistributor", result);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  isRetailer: function (event) {
    event.preventDefault();
    var processId = parseInt($(event.target).data("id"));

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const checkAccount = document.querySelector("#check-id").value;
        return instance.isRetailer(checkAccount);
      })
      .then(function (result) {
        if (result) {
          document.querySelector("#is-retailer").textContent = "is Retailer";
          document.querySelector("#is-not-retailer").textContent = "";
        } else {
          document.querySelector("#is-retailer").textContent = "";
          document.querySelector("#is-not-retailer").textContent =
            "is no Retailer";
        }
        $("#ftc-item").text(result);
        console.log("isRetailer", result);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  addRetailer: function (event) {
    event.preventDefault();
    var processId = parseInt($(event.target).data("id"));

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const checkAccount = document.querySelector("#check-id").value;
        return instance.addRetailer(checkAccount);
      })
      .then(function (result) {
        $("#ftc-item").text(result);
        console.log("addRetailer", result);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  isConsumer: function (event) {
    event.preventDefault();
    var processId = parseInt($(event.target).data("id"));

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const checkAccount = document.querySelector("#check-id").value;
        return instance.isConsumer(checkAccount);
      })
      .then(function (result) {
        if (result) {
          document.querySelector("#is-consumer").textContent = "is Consumer";
          document.querySelector("#is-not-consumer").textContent = "";
        } else {
          document.querySelector("#is-consumer").textContent = "";
          document.querySelector("#is-not-consumer").textContent =
            "is no Consumer";
        }
        $("#ftc-item").text(result);
        console.log("isConsumer", result);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  addConsumer: function (event) {
    event.preventDefault();
    var processId = parseInt($(event.target).data("id"));

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const checkAccount = document.querySelector("#check-id").value;
        return instance.addConsumer(checkAccount);
      })
      .then(function (result) {
        $("#ftc-item").text(result);
        console.log("addConsumer", result);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  fetchEvents: function () {
    if (
      typeof App.contracts.SupplyChain.currentProvider.sendAsync !== "function"
    ) {
      App.contracts.SupplyChain.currentProvider.sendAsync = function () {
        return App.contracts.SupplyChain.currentProvider.send.apply(
          App.contracts.SupplyChain.currentProvider,
          arguments
        );
      };
    }

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        var events = instance.allEvents(function (err, log) {
          if (!err)
            $("#ftc-events").append(
              "<li>" + log.event + " - " + log.transactionHash + "</li>"
            );
        });
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
