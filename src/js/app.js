App = {
    web3Provider: null,
    contracts: {},
    metamaskAccountID: "0x0000000000000000000000000000000000000000",

    states: [
        "Bottled at the Winery",
        "For Sale at the Winery",
        "Bought by Distributor",
        "Shipped by the Distributor",
        "Received by the Retailer",
        "Listed for Sale by the Retailer",
        "Bought by a Consumer",
        "Opened"
    ],


    init: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }

        App.getMetaskAccountID();

        return App.initSupplyChain();
    },

    getMetaskAccountID: async function () {
        web3 = new Web3(App.web3Provider);

        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            App.metamaskAccountID = accounts[0];
        } catch (err) {
            console.log(err.message);
        }

    },

    initSupplyChain: function () {
        /// Source the truffle compiled smart contracts
        var jsonSupplyChain = '../../build/contracts/SupplyChain.json';

        /// JSONfy the smart contracts
        $.getJSON(jsonSupplyChain, function (data) {
            var SupplyChainArtifact = data;
            App.contracts.SupplyChain = TruffleContract(SupplyChainArtifact);
            App.contracts.SupplyChain.setProvider(App.web3Provider);

            App.fetchEvents();

        });

        return App.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async function (event) {
        event.preventDefault();

        App.getMetaskAccountID();

        var processId = parseInt($(event.target).data('id'));

        switch (processId) {
            case 1:
                await App.bottleItem();
                break;
            case 2:
                await App.sellItem();
                break;
            case 3:
                await App.buyItem();
                break;
            case 4:
                await App.shipItem();
                break;
            case 5:
                await App.receiveItem();
                break;
            case 6:
                await App.listForSale();
                break;
            case 7:
                await App.purchaseItem();
                break;
            case 8:
                await App.open();
                break;
            case 9:
                await App.fetchItem();
                break;
        }
    },

    bottleItem: async function () {

        const originWineryName = $("#originWineryName").val();
        const originWineryInformation = $("#originWineryInformation").val();
        const originWineryLatitude = $("#originWineryLatitude").val();
        const originWineryLongitude = $("#originWineryLongitude").val();
        const wineDesc = $("#wineDesc").val();

        try {
            const instance = await App.contracts.SupplyChain.deployed();
            await instance.bottleItem(
                App.metamaskAccountID,
                originWineryName,
                originWineryInformation,
                originWineryLatitude,
                originWineryLongitude,
                wineDesc,
                { from: App.metamaskAccountID });
        } catch (err) {
            console.log(err.message);
        }

    },

    sellItem: async function () {
        try {
            const instance = await App.contracts.SupplyChain.deployed();
            const upc = +$("#wineryUpc").val();
            const price = web3.utils.toWei($("#price").val(), "ether");
            await instance.sellItem(upc, price, { from: App.metamaskAccountID });
        } catch (err) {
            console.log(err.message);
        }
    },


    buyItem: async function () {
        try {
            const instance = await App.contracts.SupplyChain.deployed();
            const upc = +$("#distributorUpc").val();
            const price = web3.utils.toWei($("#distributorPrice").val(), "ether");
            await instance.buyItem(upc, { from: App.metamaskAccountID, value: price });
        } catch (err) {
            console.log(err.message);
        }
    },

    shipItem: async function () {
        try {
            const instance = await App.contracts.SupplyChain.deployed();
            const upc = +$("#distributorUpc").val();
            await instance.shipItem(upc, { from: App.metamaskAccountID });
        } catch (err) {
            console.log(err.message);
        }
    },

    receiveItem: async function (event) {
        try {
            const instance = await App.contracts.SupplyChain.deployed();
            const upc = +$("#retailerUpc").val();
            await instance.receiveItem(upc, { from: App.metamaskAccountID });
        } catch (err) {
            console.log(err.message);
        }
    },


    listForSale: async function () {
        try {
            const instance = await App.contracts.SupplyChain.deployed();
            const upc = +$("#retailerUpc").val();
            const price = web3.utils.toWei($("#retailPrice").val(), "ether");
            await instance.listForSale(upc, price, { from: App.metamaskAccountID });
        } catch (err) {
            console.log(err.message);
        }
    },

    purchaseItem: async function () {
        try {
            const instance = await App.contracts.SupplyChain.deployed();
            const upc = +$("#consumerUpc").val();
            const price = web3.utils.toWei($("#consumerPrice").val(), "ether");
            await instance.purchaseItem(upc, { from: App.metamaskAccountID, value: price });
        } catch (err) {
            console.log(err.message);
        }
    },

    open: async function () {
        try {
            const instance = await App.contracts.SupplyChain.deployed();
            const upc = +$("#consumerUpc").val();
            await instance.open(upc, { from: App.metamaskAccountID });
        } catch (err) {
            console.log(err.message);
        }
    },

    fetchItem: async function () {
        const upc = $('#upc').val();
        try {
            const instance = await App.contracts.SupplyChain.deployed();
            let result1 = await instance.fetchItemBufferOne(upc);
            result2 = await instance.fetchItemBufferTwo(upc);

            $("#retrOwnerID").val(result1.ownerID);
            $("#retrOriginWineryID").val(result1.originWineryID);
            $("#retrOriginWineryName").val(result1.originWineryName);
            $("#retrOriginWineryInformation").val(result1.originWineryInformation);
            $("#retrOriginWineryLatitude").val(result1.originWineryLatitude);
            $("#retrOriginWineryLongitude").val(result1.originWineryLongitude);
            $("#retrWineDesc").val(result2.wineDesc);
            $("#retrPrice").val(web3.utils.fromWei(result2.price.toString(), "ether"));
            $("#retrRetailPrice").val(web3.utils.fromWei(result2.retailerPrice.toString(), "ether"));
            $("#retrDistributorID").val(result2.distributorID);
            $("#retrRetailerID").val(result2.retailerID);
            $("#retrConsumerID").val(result2.consumerID);
            $("#retrItemState").val(App.states[+result2.itemState.toString()]);


        } catch (err) {
            console.log(err.message);
        }
    },

    fetchEvents: function () {
        if (typeof App.contracts.SupplyChain.currentProvider.sendAsync !== "function") {
            App.contracts.SupplyChain.currentProvider.sendAsync = function () {
                return App.contracts.SupplyChain.currentProvider.send.apply(
                    App.contracts.SupplyChain.currentProvider,
                    arguments
                );
            };
        }

        App.contracts.SupplyChain.deployed().then(function (instance) {
            var events = instance.allEvents(function (err, log) {
                if (!err)
                    $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
                if (log.event === "Bottled") {
                    const upc = parseInt(log.data, 16);
                    alert(`Bottle with UPC ${upc} created!`)
                }
            });
        }).catch(function (err) {
            console.log(err.message);
        });

    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
