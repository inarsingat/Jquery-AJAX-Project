$(document).ready(function () {

    loader('#home'); 
    let sixthCoin;  
    let coinsArr = [];
    let toggled = [];

    function loader(parentElment){
        $(`<div></div>`).appendTo(parentElment).addClass('mainLoader');
    }
    
    getRequest('https://api.coingecko.com/api/v3/coins/list').then(info => {
        $('#home').empty();
        for (let i = 0; i < 100; i++) {
            init(info, i)
            coinsArr.push(info[i]);
        }
    })

    $('#homebtn').click(function (e) {
        $('#live').empty();
        $('#about').empty();
        $('#home').empty();
        for (let i = 0; i < coinsArr.length; i++) {
            init(coinsArr, i);
        }
    })

    $('#livebtn').click(function (e) {
        $('#about').empty();
        $('#home').empty();
        $('#live').addClass('in active');
        liveReport(toggled);
    })

    $('#aboutbtn').click(function (e) {
        $('#about').addClass('in active')
        aboutInfo();
        $('#home').empty();
        $('#live').empty();
    })

    $('#searchBtn').click(function (e) {
        let searched = coinsArr.filter(coin => coin.symbol === $('#searchInput').val())
        $('#home').empty();
        init(searched,0)
        $('#searchInput').val('');
    })

    function createCard(data, index) {
        $(`<div></div>`).addClass('col-12 col-md-4').appendTo('#home').attr('id', 'cardDiv' + index);
        $(`<div></div>`).addClass('card').appendTo('#cardDiv' + index).attr('id', 'card' + index);
        $(`<div></div>`).addClass('card-body').appendTo('#card' + index).attr('id', 'body' + index);
        $(`<h5>${data[index].symbol.toUpperCase()}</h5>`).addClass('card-title title').appendTo('#body' + index).attr('id', 'title' + index);
        switchBtn(data, index, '#title' + index);
        $(`<span></span>`).appendTo('#label' + index).addClass('slider');
        $(`<p>${data[index].name}</p>`).addClass('card-text').appendTo('#body' + index);
        $(`<button>${'More Info'}</button>`).addClass('card-title btn btn-info').appendTo('#body' + index)
            .attr({'data-toggle': 'collapse','data-target': '#collapseInfo','id': 'btn' + index});
        if (toggled.length != 0) {
            for (i = 0; i < toggled.length; i++) {
                if (toggled[i] == data[index].symbol.toUpperCase()) {
                    $('#check' + index).prop('checked', true);
                }
            }
        }
    }

    function switchBtn(data, index, parentElement) {
        $(`<label></label>`).attr({'id': 'label' + index,'class': 'switch'}).appendTo(parentElement);
        $('<input/>').attr({'type': 'checkbox'}).appendTo('#label' + index).attr('id', 'check' + index).change(function (e) {
            if (this.checked) {
                toggled.push(data[index].symbol.toUpperCase());
                if (toggled.length > 5) {
                    $('#check' + index).prop('checked', false);
                    sixthCoin = index;
                    toggled.pop();
                    createModal(toggled);
                    $('#coinsModal').modal('show');
                }
            } else {
                let place = toggled.findIndex(coin => coin == data[index].symbol.toUpperCase())
                toggled.splice(place, 1);
            }
        })
    }

    function getInfo(id, index) {
        $(`<div></div>`).appendTo('#body' + index).addClass('collapse').attr('id', 'collapseInfo' + index);
        $(`<div></div>`).addClass('loader').appendTo('#collapseInfo' + index);
        $('#collapseInfo' + index).collapse('show');
        $('#collapseInfo' + index).css({
            'font-family': 'Courier New, Courier, monospace',
            'font-weight': 'bold',
            'font-size': '15px'
        })
        getFromStorage(id, '#collapseInfo' + index, index)
    }

    function createInfoCard(parentElement, index, info) {
        $(parentElement).empty();
        $(`</br>`).appendTo(parentElement);
        $(`<p>${'"USD" Value: '+info.market_data.current_price.usd+' $'}</p>`).appendTo(parentElement);
        $(`<p>${'"EUR" Value: '+info.market_data.current_price.eur +' \u20AC'}</p>`).appendTo(parentElement);
        $(`<p>${'"NIS" Value: '+info.market_data.current_price.ils+' \u20AA'}</p>`).appendTo(parentElement);
        $(`<p></p>`).appendTo(parentElement).attr('id', 'img' + index).css('float', 'right');
        $(`<img></img>`).attr('src', info.image.large).appendTo('#img' + index).css({
            'height': '60px',
            'width': '60px'
        });
    }

    function moreInfo(arr, i) {
        $('#btn' + i).click(function (e) {
            getInfo(arr[i].id, i);
            $('.collapse').collapse('hide')
            $('.collapse').empty();
        })
    }

    function init(info, i) {
        createCard(info, i);
        moreInfo(info, i);
    }

    function setToLocalStorage(id, obj) {
        let time = new Date();
        let minutes = time.getMinutes();
        obj['currentTime'] = minutes;
        window.localStorage.setItem(id, JSON.stringify(obj));
    }

    function getFromStorage(id, parentElement, index) {
        let time = new Date();
        let minutes = time.getMinutes();
        var savedInfo = JSON.parse(window.localStorage.getItem(id));
        if ((savedInfo != null) && (minutes - savedInfo['currentTime']) < 2) {
            createInfoCard(parentElement, index, savedInfo)
        } else {
            getRequest('https://api.coingecko.com/api/v3/coins/' + id).then(info => {
                createInfoCard(parentElement, index, info);
                setToLocalStorage(id, info);
            })
        }
    }

    function createModal(arr) {
        $('.modal-body').empty();
        for (let i = 0; i < arr.length; i++) {
            $(`<div></div>`).appendTo('.modal-body').attr('id', 'div' + i)
            $(`<label></label>`).attr('id', 'switch' + i).appendTo('#div' + i).addClass('switch');
            $(`<input/>`).attr('type', 'checkbox').appendTo('#switch' + i).attr('id', 'box' + i)
            $(`<span></span>`).appendTo('#switch' + i).addClass('slider');
            $(`<span>${arr[i]}</span>`).appendTo('#div' + i).addClass('modalinput')
            $('#box' + i).prop('checked', true).change(function (e) {
                if (this.checked == false) {
                    let index = coinsArr.findIndex(coin => coin.symbol.toUpperCase() == arr[i]);
                    $('#check' + index).prop('checked', false);
                    let index1 = arr.findIndex(coin => coin == arr[i])
                    arr.splice(index1, 1);
                    $('#check'+sixthCoin).prop('checked',true);
                    arr.push(coinsArr[sixthCoin].symbol.toUpperCase())
                }
                $('#box' + i).prop('checked', false);
                setTimeout(function () {
                    $('#coinsModal').modal('hide')
                }, 1000)
            })
        }
    }

function getRequest(url) {       
    return $.get(url)
}

function liveReport(arr){
    $(`<div></div>`).attr({'id':'chartContainer'}).appendTo('#live');
    let allCoinsData = [];
    for(let j=0;j<arr.length;j++){
        let coinData=[];
        allCoinsData.push(coinData);
    }
    let color = ['green','red','blue','purple','pink']
    let forCanvas = arr.map((coin,i)=>({
        type: "spline",
        showInLegend: true,
        name: coin,
        markerType: "cross",
        color: color[i],   
        dataPoints: allCoinsData[i]
    }))
    
    var chart = new CanvasJS.Chart("chartContainer", {
            animationEnabled: true,
            theme: "light1",
            title:{
                text:'Live Review of Coins Value'},
            axisX:{
                crosshair: {
                    enabled: true,
                    snapToDataPoint: true
                }
            },
            axisY: {
                includeZero:false,
                title: "Coin Value in USD",
                suffix : "$",
                crosshair: {
                    enabled: true
                }
            },
            toolTip:{
                shared:true
            }, 
            legend:{
                cursor:"pointer",
                verticalAlign: "top",
                horizontalAlign: "right",
                dockInsidePlotArea: true,
                itemclick: toogleDataSeries
            },
            data:forCanvas
    });
    function toogleDataSeries(e){
        if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else{
            e.dataSeries.visible = true;
        }  
    }
    function updateChart() {
        getRequest(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${arr}&tsyms=USD`).then(value =>{
            for(let i=0;i<arr.length;i++){
                let dataObject = {
                    x: new Date(),
                    y: value[`${arr[i]}`].USD
                }
                allCoinsData[i].push(dataObject);
                if(allCoinsData[i].length>15){
                    allCoinsData[i].shift();
                }
            }
            chart.render();
        })
    }
    updateChart();
    setInterval(function(){ updateChart() }, 2000); 
}

function aboutInfo(){
    $(`<p></p>`).appendTo('#about').attr({'id':'aboutP','class':'col-12'})
    $(`</br>`).appendTo('#aboutP')
    $(`<a href="https://www.facebook.com/inara.singat" target="_blank";>${'My FaceBook Page'}
    <img height=40 width=40 src="https://pre00.deviantart.net/28d6/th/pre/f/2011/256/0/f/facebook_button_by_ipiingu-d49r2ux.png";> </a>`).appendTo('#aboutP');
    $(`<p></p>`).appendTo('#about').attr({'id':'aboutP2','class':'col-12'})
    $(`</br>`).appendTo('#aboutP2')
    $(`<a href="https://www.instagram.com/inarasi/" target="_blank";>${'My Instagram Account'}
    <img height=45 width=50 src="https://sguru.org/wp-content/uploads/2018/01/instagram-colourful-icon.png";></a>`).appendTo('#aboutP2');
}
})