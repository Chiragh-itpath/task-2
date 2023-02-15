$(document).ready(function() {
    $('.w-100').hide()
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    const roundUp = val => {
        val = parseFloat((Math.round(val * 10) / 10).toFixed(2))
        return val == 0 ? '0.0' : val
    }
    const textColor = val => val >= 0 ?  'text-success' : 'text-danger'
    const commaSeprate = val => (val !== null) ? parseFloat(val).toLocaleString() : '∞'
    const getWidth = val => parseFloat((((val.current_price.usd - val.low_24h.usd) * 100) / (val.high_24h.usd - val.low_24h.usd)).toFixed(2))
    const getArrow = val => {
        val = val.toFixed(1)
        return `<span class="text-${val > 0 ? 'success' : 'danger'}">${Math.abs(val)}%<span> <i class="fa-solid text-${val > 0 ? 'success' : 'danger'} fa-arrow-turn-${val > 0 ? 'up' : 'down'}"></i>`
    }
    const getColor = val => val < 0 ? 'rgba(220,0,0,1)' : 'rgba(0,220,0,0.7)'
    const id = new URLSearchParams(window.location.search).get('id')
    var per
    const getData = () => {
        $.ajax({
            method: 'GET',
            url: 'https://api.coingecko.com/api/v3/coins/' + id,
            success: function(data) {
                $('.rank').text(`Rank #${data.market_cap_rank}`)
                $('.logo').attr('src',data.image.thumb)
                $('.coin-symbol').text(data.symbol.toUpperCase())
                $('.coin-name').text(data.name)
                $('.coin-price').text(`$${commaSeprate(data.market_data.current_price.usd)}`) 
                $('.price-change').html(`
                    <i class="fa-solid fa-caret-${data.market_data.price_change_percentage_24h > 0 ? 'up' : 'down'}"></i>
                    ${roundUp(Math.abs(data.market_data.price_change_percentage_24h))}%
                    `)
                    .addClass(textColor(data.market_data.price_change_percentage_24h))
                $('.btc-price').text(parseFloat(data.market_data.current_price.btc).toFixed(8))
                $('.arrow').html(getArrow(data.market_data.price_change_percentage_24h_in_currency.btc))
                $('.progress-bar').css('width',`${getWidth(data.market_data)}%`)
                $('.min').text(`$${commaSeprate((data.market_data.low_24h.usd))}`)
                $('.max').text(`$${commaSeprate(data.market_data.high_24h.usd)}`)
                $('.market-cap').text(`$${commaSeprate(data.market_data.market_cap.usd)}`)
                $('.fdv').text(`${parseFloat(data.market_data.market_cap.usd / data.market_data.fully_diluted_valuation.usd).toFixed(2)}`)
                $('.t-vol').text(`$${commaSeprate(data.market_data.total_volume.usd)}`)
                $('.d-val').text(`$${commaSeprate(data.market_data.fully_diluted_valuation.usd)}`)
                if(jQuery.isEmptyObject(data.market_data.fully_diluted_valuation)) {
                    $('.d-val').parent().remove()
                }
                if(data.market_data.total_value_locked == null) {
                    $('.tvl').parent().removeClass('d-flex').addClass('d-none')
                    $('.m-cap-tvl').parent().removeClass('d-flex').addClass('d-none')
                } else {
                    $('.tvl').text(`$${commaSeprate(data.market_data.total_value_locked.usd)}`)
                    $('.tvl-ratio').text(`${parseFloat(data.market_data.fully_diluted_valuation.usd / data.market_data.total_value_locked.usd).toFixed(2)}`)
                    $('.m-cap-tvl').text(`${(data.market_data.market_cap.usd / data.market_data.total_value_locked.usd).toFixed(2)}`)
                }
                $('.c-supply').text(`${commaSeprate(data.market_data.circulating_supply)}`)
                $('.t-supply').text(`${commaSeprate(data.market_data.total_supply)}`)
                $('.m-supply').text(`${commaSeprate(data.market_data.max_supply)}`)
                $('.w-100').show()
                $('.loading').addClass('d-none').removeClass('d-flex')
                per = data.market_data.price_change_percentage_24h
                getChart(id,data.market_data.price_change_percentage_24h,1)
            },
            error: function(err) {  
                $('.loading').addClass('d-flex').removeClass('d-none')
                setTimeout(() => {
                    getData()
                }, 5000);
            }
        })
    }
    getData()
    const getChart = (id,per,day) => {
        canvas = $('.chart')
        $.ajax({
            type: 'GET',
            url: `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${day}`,
            success: function(data) {
                data = data.prices.map(val => ({x:val[0],y:parseFloat(val[1])}))
                var xValues = data.map(val => val.x)
                var yValues = data.map(val => val.y)
                new Chart(canvas,{
                    type: 'line',
                    data : {
                        labels: xValues,
                        datasets: [{
                            fill: false,
                            lineTension: 0.5,
                            backgroundColor: "rgb(220,220,220)",
                            borderColor: getColor(per),
                            borderWidth: 2,
                            data: yValues
                        }]
                    },
                    options: {
                        elements: { point: { radius: 0 } },
                        plugins: { 
                            legend: { display: false },
                            tooltips: { enabled: false }
                        },
                        scales: {
                            x: { display: false },
                            // y: { display: false }
                        }, 
                    }
                })
                $('.wrapper').addClass('d-none').removeClass('d-flex')
                $('canvas').removeClass('d-none')
            },
            error: function(err) {
                $('.wrapper').addClass('d-flex').removeClass('d-none')
                setTimeout(() => {
                    getChart(id,per,day)
                }, 5000);
            }
        })
        return true
    }
    $('.btn-group .btn').click(function() {
        var container = `
            <div class="wrapper">
                <span class="dot dot-small"></span>
                <span class="dot dot-small"></span>
                <span class="dot dot-small"></span>
                <span class="dot dot-small" ></span>
            </div>
            <canvas class="chart d-none"></canvas>
        `
        $('.chart-container').empty().html(container)
        if(getChart(id,per,$(this).data('val'))) {
            $('.btn').removeClass('active')
            $(this).addClass('active')
        }
    })
    $('[data-bs-toggle="tooltip"]').on({
        'click':function() {
            $(this).tooltip().show()
        },
        'mouseout': function() {
            console.log('bye')
        }
    })
})