$(document).ready(() => {
    var tableData = ''
    var canvas,myChart
    const roundUp = (val) => {
        val = parseFloat((Math.round(val * 10) / 10).toFixed(2))
        return val == 0 ? '0.0' : val
    }
    const textColor = val => roundUp(val) >= 0 ?  'text-success' : 'text-danger'
    const commaSeprate = val => (val !== null) ? parseFloat(val).toLocaleString() : '∞'
    
    $('#tbody').on('click','.info', function() {
        window.location.href = 'coin.html?id=' + $(this).data('id')
        
    })
    const getData = () => {
        $.ajax({
            type: 'GET',
            url: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d',
            success: function(coins) {
                coins.forEach(coin => {
                    tableData += 
                    `<tr>
                        <td>${coin.market_cap_rank}</td>
                        <td valign="top"  class="info" data-id="${coin.id}">
                            <img src="${coin.image}" class="align-self-center" alt "" /><b class="mx-1 align-self-center">${coin.name}</b>
                            <span class="text-secondary align-self-center mx-2">${coin.symbol.toUpperCase()}</span>
                            </td>
                        <td>$${commaSeprate(coin.current_price)}</td>
                        <td class='${textColor(coin.price_change_percentage_1h_in_currency)}'>
                            ${roundUp(coin.price_change_percentage_1h_in_currency)}%
                        </td>
                        <td class='${textColor(coin.price_change_percentage_24h_in_currency)}'>
                            ${roundUp(coin.price_change_percentage_24h_in_currency)}%
                        </td>
                        <td class='${textColor(coin.price_change_percentage_7d_in_currency)}'>
                            ${roundUp(coin.price_change_percentage_7d_in_currency)}%
                        </td>
                        <td>$${commaSeprate(coin.total_volume)}</td>
                        <td>$${commaSeprate(coin.market_cap)}</td>
                        
                    </tr>`
                });
                $('table').removeClass('d-none')
                $('#tbody').html('')
                $('#tbody').html(tableData)
                $('#table').DataTable()
                $('.loading').addClass('d-none').removeClass('d-flex')
                tableData = ''
            },
            error: function(err) {
                $('table').addClass('d-none')
                $('.loading').addClass('d-flex').removeClass('d-none')
                setTimeout(() => {
                    getData()
                }, 5000);
            }
        })
    }
    getData()
    // const getChartData = () => {
    //     $.ajax({
    //         type: 'GET',
    //         url: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d',
    //         success: function(coins) {
    //             coins.forEach(coin => {
    //                 setTimeout(() => {
    //                     getChart(coin.id + ' ' + coin.price_change_percentage_24h)
    //                 }, 5000);
    //             })
    //         },
    //         error: function(err) {
    //             setTimeout(() => {
    //                 getChartData()
    //             }, 5000);
    //         }
    //     })
    // }
    
    // getChartData()
})