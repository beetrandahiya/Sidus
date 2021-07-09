j = -100;
var pivl = [];
var pivltr = [];
while (j < 100) {
    vl = j * (math.pi) / 2;
    pivl.push(vl); //making a array containing values of n*pi/2
    vltr = parseFloat(vl.toFixed(2));
    pivltr.push(vltr);
    j++;
}
clcktm = 0;



document.getElementById('inputfunc').addEventListener('input', (ev) => {
    // `ev.target` is an instance of `MathfieldElement`
    funcinp = ev.target.getValue('ascii-math');
});
document.getElementById('inputfunc').setOptions({
  virtualKeyboardMode: "auto",
  virtualKeyboards: 'numeric functions'
});


function plotgraph() {

    funcinp.trim();
    funcinp = funcinp.replace(/⋅/g, "*");

    var dmnstart = parseFloat(document.getElementById("dmnstart").value);
    var dmnend = parseFloat(document.getElementById("dmnend").value);

    const expr = math.compile(funcinp);
    xValues = math.range(dmnstart, dmnend, 0.01).toArray();
    xValues = xValues.map(a => parseFloat(a.toFixed(2)));
    i = 0;
    while (i < xValues.length) {
        if (pivltr.includes(xValues[i])) {
            j = pivltr.indexOf(xValues[i]);
            xValues[i] = pivl[j];
        }
        i++;
    }
    const yValues = xValues.map(function (x) {
        return expr.evaluate({
            x: x
        })
    });

    ///////////////////////   find infinities and roots ////////////////////////////////////////////////
    k = 0;
    rootsx = [];
    rootsy = [];
    while (k < yValues.length) {
        if (yValues[k] > (10 ** 15)) { //positive infinity
            yValues[k] = Infinity;
        };
        if (yValues[k] < -(10 ** 15)) { //negative infinity
            yValues[k] = -Infinity;
        }

        if (yValues[k] == 0) { //roots  --> y=0
            rootsx.push(xValues[k]);
            rootsy.push(yValues[k]);
        }
        if (Math.abs(yValues[k]) < (10 ** -12)) { //roots  ----> abs(y)< 10^-12
            yValues[k] = 0;
            rootsx.push(xValues[k]);
            rootsy.push(yValues[k]);
        }
        k++;
    }

    //////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////   continuity   /////////////////////////////////
    /*method of calculating limit is not very basic, but works 

    rhl= lim(a+)f(x)
    lhl= lim(a-)f(x)
    limvl=  (rhl+lhl)/2

    continous if =>  limvl = f(a)  [both rounded to 2 decimals]
    */
    /////////////todo------>> categorize among jump, removable, infinite discontinuity




    discntpoints = []; //to count discontinous points

    k = 0;
    while (k < yValues.length) {

        rhl = expr.evaluate({
            x: xValues[k] + 0.000000001
        });
        lhl = expr.evaluate({
            x: xValues[k] - 0.000000001
        });

        if (!(isNaN(rhl) || isNaN(lhl))) {


            limvl = parseFloat(((rhl + lhl) / 2).toFixed(2))
            fval = parseFloat(parseFloat(yValues[k]).toFixed(2))



            if (fval != limvl) {
                yValues[k] = NaN;
                discntpoints.push(xValues[k]);
            }



        }
        k++;
    }
    //console.log(discntpoints)

    /*known issue:
    discrete anomalies in floor function
    egs:  graph of floor(x^2) is not as expected

    */
    //////////////////////////////////////////////////////////////////////////////////////////
    wrkwdth = $("#workspace").width();
    wrkwdth = wrkwdth - 50;
    wrkrng = wrkwdth / 60;

    var plotline = { //making plot dataset
        x: xValues,
        y: yValues,
        name: funcinp,
        type: 'scatter',
        showlegend: false,
        line: {
            color: 'rgba(82,154,226, 0.8)'
        }
    };

    var roots = { //making roots dataset
        x: rootsx,
        y: rootsy,
        name: 'root',
        type: 'scatter',
        mode: 'markers',
        marker: {
            color: 'rgba(82,154,226, 1)',
            size: 5
        },
        showlegend: false
    };

    if($("body").hasClass("dark-bg")){
        darkplottoggle = 1;
        }
        else{
            darkplottoggle=0;
        }
    if (darkplottoggle == 0) {
        layout = { //making layout
            xaxis: {
                range: [-wrkrng, wrkrng]
            },
            yaxis: {
                range: [-10, 10]
            },
            width: wrkwdth,
            height: 600,
            dragmode: 'pan',
            autosize: false,
            hovermode: 'closest',
            margin: {
                l: 20,
                r: 20,
                b: 20,
                t: 20,
                pad: 4
            },
            paper_bgcolor: '#fdfcfc',
            plot_bgcolor: '#fdfcfc'
        };
    }
    else {
        layout = { //making layout
            xaxis: {
                range: [-wrkrng, wrkrng]
            },
            yaxis: {
                range: [-10, 10]
            },
            width: wrkwdth,
            height: 600,
            dragmode: 'pan',
            autosize: false,
            hovermode: 'closest',
            margin: {
                l: 20,
                r: 20,
                b: 20,
                t: 20,
                pad: 4
            },
            paper_bgcolor: '#25232D',
            plot_bgcolor: '#25232D'
        };
    };



    data = [plotline, roots];


    if (clcktm == 0) {
        Plotly.newPlot('plotarea', data, layout, {
            displaylogo: false,
            scrollZoom: true,
            responsive: true,
            modeBarButtonsToRemove: ['select2d', 'lasso2d', 'toggleSpikelines', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian']
        });
        clcktm = 1;
    } else if (clcktm == 1) {
        Plotly.animate('plotarea', {
            data: data
        }, {
            transition: {
                duration: 500,
                easing: 'cubic-in-out'
            },
            frame: {
                duration: 500
            }
        })
    }

}

//////////////////////////////////////// find derivative ////////////////////////////////////////

// using an internal funcion math.derivative(f(x),variable) of math.js
// example:  math.derivative('x^2-2x','x') // --> Node { 2*x-2 }
// then compile the node and then evaluate the compiled node 

derivtoggle = 0
////////////////////////////////////////////////////////////////////////////////////////////////


function findderivative() {


    //////////////////////////////////calculating derivative and making dataset done

    if (derivtoggle == 0) {
        //calculating derivative
        deriv = math.derivative(funcinp, 'x'); //calculating derivative in advance
        derivc = deriv.compile();
        // console.log(derivc.evaluate({x:0}));
        derivstr = deriv.toString();
        const derivValues = xValues.map(function (x) {
            return derivc.evaluate({
                x: x
            })
        });

        derivline = { //making derivative plot dataset
            x: xValues,
            y: derivValues,
            name: derivstr,
            type: 'scatter',
            showlegend: false,
            line: {
                color: 'rgba(82,154,226, 0.4)'
            }
        };
        data.push(derivline); //adding it into main data

        Plotly.react('plotarea', data, layout, {
            displaylogo: false,
            scrollZoom: true,
            responsive: true,
            modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian']
        }); //using Plotly.react becoz its faster , it creates the plot again

        derivtoggle = 1;
    } else {
        data.pop(); //removing derivative from data
        Plotly.react('plotarea', data, layout, {
            displaylogo: false,
            scrollZoom: true,
            responsive: true,
            modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian']
        }); //using Plotly.react becoz its faster , it creates the plot again
        derivtoggle = 0;
    }





}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////


//dark mode toggle


function toggledark() {
    $("body").toggleClass("dark-bg");
    $(".navbar").toggleClass("dark-bg"); //navbar
    $(".navbar").toggleClass("text-white");
    $("#dmnstart").toggleClass("dark-bg"); //domain inputs
    $("#dmnend").toggleClass("dark-bg");
    $("#workspace").toggleClass("dark-bg"); //workspace

    // $("#controls").toggleClass("bg-dark");


    if (!$("#controls").hasClass('bg-dark')) {
        $("#controls").removeClass('bg-white');
        $("#controls").addClass('bg-dark');
        $("#controls").addClass('text-white');
    } else {
        $("#controls").removeClass('bg-dark');
        $("#controls").addClass('bg-white');
        $("#controls").removeClass('text-white');
    }


    /////////////////////////////////////// home button icon change /////////////////////////////////////////////////////////

    if (!$("#home-btn").hasClass('whitebtn')) {
        $("#home-btn").attr('src', './content/icons/homewhite.png');
        $("#home-btn").addClass('whitebtn')
    } else {
        $("#home-btn").attr('src', './content/icons/homeblack.png');
        $("#home-btn").removeClass('whitebtn')
    }


    /////////////////////////////////////// apps button icon change ////////////////////////////////////////////////


    if (!$("#apps-btn").hasClass('whitebtn')) {
        $("#apps-btn").attr('src', './content/icons/appswhite.png');
        $("#apps-btn").addClass('whitebtn')
    } else {
        $("#apps-btn").attr('src', './content/icons/appsblack.png');
        $("#apps-btn").removeClass('whitebtn')
    }


    ////////////////////////////////////// about button icon change ////////////////////////////////////////////////////


    if (!$("#about-btn").hasClass('whitebtn')) {
        $("#about-btn").attr('src', './content/icons/aboutwhite.png');
        $("#about-btn").addClass('whitebtn')
    } else {
        $("#about-btn").attr('src', './content/icons/aboutblack.png');
        $("#about-btn").removeClass('whitebtn')
    }


    ///////////////////////////////////// dark mode button icon change ////////////////////////////////////////////////


    if (!$("#drkmd-btn").hasClass('whitebtn')) {
        $("#drkmd-btn").attr('src', './content/icons/sun.png');
        $(".btn-round").addClass('bg-white');
        $(".btn-round").removeClass('bg-dark');
        $("#drkmd-btn").addClass('whitebtn')
    } else {
        $("#drkmd-btn").attr('src', './content/icons/moon.png');
        $("#drkmd-btn").removeClass('whitebtn');
        $(".btn-round").removeClass('bg-white');
        $(".btn-round").addClass('bg-dark');
    }
    // $("#home-btn").attr("src", "https://i.ibb.co/jk16rtx/icons8-home-96.png ");
    //$("#apps-btn").attr("src", "https://i.ibb.co/bHgm7zx/icons8-circled-menu-96-1.png ");


    ////////////////////////////// Plot dark mode toggle //////////////////////////////////////////////////////////////



    if (darkplottoggle == 0) {
        layout = { //making layout
            xaxis: {
                range: [-wrkrng, wrkrng]
            },
            yaxis: {
                range: [-10, 10]
            },
            width: wrkwdth,
            height: 600,
            dragmode: 'pan',
            autosize: false,
            hovermode: 'closest',
            margin: {
                l: 20,
                r: 20,
                b: 20,
                t: 20,
                pad: 4
            },
            paper_bgcolor: '#25232D',
            plot_bgcolor: '#25232D'
        };
        Plotly.react('plotarea', data, layout, {
            displaylogo: false,
            scrollZoom: true,
            responsive: true,
            modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian']
        }); //using Plotly.react becoz its faster , it creates the plot again

        darkplottoggle = 1;

    } else {

        layout = { //making layout
            xaxis: {
                range: [-wrkrng, wrkrng]
            },
            yaxis: {
                range: [-10, 10]
            },
            width: wrkwdth,
            height: 600,
            dragmode: 'pan',
            autosize: false,
            hovermode: 'closest',
            margin: {
                l: 20,
                r: 20,
                b: 20,
                t: 20,
                pad: 4
            },
            paper_bgcolor: '#fcfcfc',
            plot_bgcolor: '#fcfcfc'
        };
        Plotly.react('plotarea', data, layout, {
            displaylogo: false,
            responsive: true,
            scrollZoom: true,
            modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian']
        }); //using Plotly.react becoz its faster , it creates the plot again

        darkplottoggle = 0;
    }






}