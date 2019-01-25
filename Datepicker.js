/**
 * Jeremy Ring
 * 12/2018
 * Cross platform datepicker calendar to be used on input form elements
 * Devd w/jquery v 1.9.1
 * 
 * Use ------------------------------------------------------
 * 
 * HTML:
    <td>
    <input id="txt_onsite_dte" alt="txt_onsite_dte" class="mcInput" onfocus="createDatepicker('someTableID', this);">
        <div style="display: none;">
            <table class="datePickerTab" id="someTableID"></table>
        </div>
    </td>

 *  Or JS:
 * //onload
    addListenerByElement(someElement, 'focus', function(){ createDatepicker('someTableID', event.srcElement)});
 */

/** Global months used by datepicker table. If you want months returned in a different format this is where you would make the change */
var dpMos = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//var dpMos = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; 

/**
 * 
 * @param {HTMLElement} element Any HTML element that you want to add a listener to  
 * @param {String} event The type of event to handle (e.g. 'click', 'focus')
 * @param {*} handler The code to be executed when the event fires
 */
function addListenerByElement(element, event, handler) {
    if (document.addEventListener) {
        element.addEventListener(event, handler, false);
    } else {
        element.attachEvent('on' + event, handler);
    }
}

/**
 * Creates/appends the elements that make up the header for the datepicker (nav buttons, mo/yr, weekdays). These values are needed consistently across all date pickers and it makes the html much cleaner/easier to assign field IDs
 * @param {HTMLTableElement} dp The empty datepicker table 
 */
function createHeader(dp) {
    var header = '<tr style="width: 100%"><th><input type="button" class="btnTraverse" id="' + dp.id + '-prevYear_exclude" alt="' + dp.id + '-prevYear_exclude" value="&lt;&lt;"></th><th><input type="button" class="btnTraverse" id="' + dp.id + '-prevMonth_exclude" alt="' + dp.id + '-prevMonth_exclude" value="&lt;"></th><th colspan="3"><p class="moyr" style="margin-right: 5px;" id="' + dp.id + '-month">January </p><p class="moyr" id="' + dp.id + '-year"></p></th><th><input class="btnTraverse" id="' + dp.id + '-nextMonth_exclude" alt="' + dp.id + '-nextMonth_exclude" type="button" value="&gt;"></th><th><input class="btnTraverse" id="' + dp.id + '-nextYear_exclude" alt="' + dp.id + '-nextYear_exclude" type="button" value="&gt;&gt;"></th></tr><tr id="' + dp.id + '-endHeader"><td class="center"><strong>Su</strong></td><td class="center"><strong>Mo</strong></td><td class="center"><strong>Tu</strong></td><td class="center"><strong>We</strong></td><td class="center"><strong>Th</strong></td><td class="center"><strong>Fr</strong></td><td class="center"><strong>Sa</strong></td></tr>';

    $(dp).append(header);
}

/**
 * Assign the current month and year to the datepicker table elements
 * @param {String} dp ID of the datepicker table 
 */
function getMonthAndYear(dp) {
    var mo = document.getElementById(dp + "-month");
    var yr = document.getElementById(dp + "-year");
    mo.innerHTML = getCurrentDate()[0];
    yr.innerHTML = getCurrentDate()[2];
}

/**
 * Gets todays date and returns it in useable parts of an array
 */
function getCurrentDate() {
    var date = new Date();
    var month = dpMos[date.getMonth()];//Get the month name at the matching index
    var day = date.getDate();
    var year = date.getFullYear();
    var parts = [month, day, year, date];
    return parts;
}

/**
 * Clears table datum values, then assigns the values for the chosen month and year
 * @param {String} dp ID of the datepicker table 
 * @param {HTMLInputElement} parent Source element for the datepicker table
 */
function getDaysOfMonth(dp, parent) {
    var year = document.getElementById(dp + "-year").innerHTML;
    var month = document.getElementById(dp + "-month").innerText;
    var curDate = getCurrentDate();
    var moIndex = dpMos.indexOf(month);
    var firstDay = new Date(year, moIndex, 1);
    var lastDay = new Date(year, moIndex + 1, 0);
    var offset = firstDay.getDay(); //What day of the week does month start (ie Saturday = 6)
    var dayCount = 1; //Counter to make sure all days are added
    var len = lastDay.getDate(); //Last date of month, i.e. 31
    var day; //Buttons with days as values <input>'s
    var dayDatum; /* <td> element */

    for (var i = 0; i < 6; i++) { /*Max of 6 weeks*/
        for (var j = 0; j < 7; j++) { /* 7 days/week */
            dayDatum = document.getElementById(dp + "-row" + i + "-column" + j); 
            while (dayDatum.firstChild) {
                dayDatum.removeChild(dayDatum.firstChild); /*Clear any children (<input>'s) added on previous calls to function */
            }
            if (offset === 0) { /*If this is not 0, month won't start on correct weekday */
                if (dayCount <= len) {
                    day = document.createElement("input");
                    day.type = "button";
                    if (dayCount === curDate[1] && month === curDate[0] && year == curDate[2]) {
                        day.className = "days curDay";
                    } else {
                        day.className = "days";
                    }
                    day.value = dayCount;
                    addListenerByElement(day, 'click', function () {
                        assignDate(dp, parent);
                    });
                    $(dayDatum).append(day);
                    dayCount++;
                }/*Don't break early -> dayDatum may still have children to remove*/
            } else {
                offset--; /* Get offset to 0 before appending new <input> elements */
            }
        }
    }
}

/**
 * Retrieves the selected date and assigns it's value to the parent INPUT field. Hides the datepicker when complete
 * @param {String} dp ID of the datepicker table
 * @param {HTMLInputElement} parent Source element for creating the datepicker
 */
function assignDate(dp, parent) {
    dp = document.getElementById(dp);
    var day = event.srcElement.value;
    var month = document.getElementById(dp.id + "-month").innerText;
    var year = document.getElementById(dp.id + "-year").innerText;
    var date = day + " " + month + " " + year;
    parent.value = date;
    hideDatepicker(dp.id);
}

/**
 * Hides a single datepicker. More efficient than using hideAllOpen if you only want to close the datepicker currently in use
 * @param {String} dp ID of the datepicker table 
 */
function hideDatepicker(dp) {
    dp = document.getElementById(dp);
    dp.parentElement.style.display = "none";
}

/**
 * Create six rows with seven columns in each row by default - each td is empty until assigned a value by getDaysOfMonth() :)
 * @param {HTMLTableElement} dp 
 */
function createRows(dp) {
    var row, datum, endHeader = document.getElementById(dp.id + "-endHeader");

    while (endHeader.nextSibling || endHeader.nextElementSibling) { /*Clear the table with each call to open dp*/
        endHeader.parentElement.removeChild(endHeader.nextSibling);
    }

    for (var i = 0; i < 6; i++) { /*Max number of weeks needed for 1 month to span is 6*/
        row = document.createElement("tr");
        row.id = dp.id + "-row" + i;
        for (var j = 0; j < 7; j++) { /*Days of the week */
            datum = document.createElement("td");
            datum.id = dp.id + "-row" + i + "-column" + j;
            datum.className = "center";
            $(row).append(datum); //Append each day cell
        }
        $(dp).append(row); //Append each week row
    }
}

/**
 * Increase year by 1 and get days for new
 * @param {String} dp ID of the datepicker table being cycled 
 * @param {HTMLInputElement} parent Source element for the datepicker table 
 */
function nextYear(dp, parent) {
    var year = document.getElementById(dp + "-year");
    var curYear = parseInt(year.innerHTML);
    curYear++;
    year.innerHTML = curYear++;
    getDaysOfMonth(dp, parent); //Get days for the new year
    return curYear++;
}

/**
 * Decrease year by 1 and get days for new
 * @param {String} dp ID of the datepicker table being cycled 
 * @param {HTMLInputElement} parent Source element for the datepicker table 
 */
function prevYear(dp, parent) {
    var year = document.getElementById(dp + "-year");
    var curYear = parseInt(year.innerHTML);
    curYear--;
    year.innerHTML = curYear;
    getDaysOfMonth(dp, parent); //Get days for the new year
    return --curYear;
}

/**
 * Go to the next month, or cycle back to January
 * @param {String} dp ID of the datepicker table being cycled 
 * @param {HTMLInputElement} parent Source element for the datepicker table 
 */
function nextMonth(dp, parent) {
    var month = document.getElementById(dp + "-month");
    var moIndex = dpMos.indexOf(month.innerText);

    if (moIndex === 11) { /*If it's december go to Jan next year*/
        month.innerHTML = dpMos[0];
        return nextYear(dp, parent); /*Will get new days on call */
    } else {
        moIndex++;
        month.innerHTML = dpMos[moIndex];
    }
    getDaysOfMonth(dp, parent); //Get days for the new month
}

/**
 * Go to previous month or cycle back to December
 * @param {String} dp ID of the datepicker table being cycled 
 * @param {HTMLInputElement} parent Source element for the datepicker table 
 */
function prevMonth(dp, parent) {
    var month = document.getElementById(dp + "-month");
    var moIndex = dpMos.indexOf(month.innerText);

    if (moIndex === 0) { /*If it's Jan go to dec prev year*/
        month.innerHTML = dpMos[11];
        return prevYear(dp, parent); //Will get new days on call
    } else {
        moIndex--;
        month.innerHTML = dpMos[moIndex];
    }
    getDaysOfMonth(dp, parent); //Get days for the new month
}

/*Prevent an event from firing (prevents document event from closing dp)*/
function cancelEvent() {
    if (event.stopPropagation) {
        event.stopPropagation();   // W3C model
    } else {
        event.cancelBubble = true; // IE model
    }
}

/*Make the dp table visible and set to width of the input element that triggers it*/
/**
 * 
 * @param {HTMLTableElement} dp 
 * @param {HTMLInputElement} parent 
 */
function showDP(dp, parent) {
    dp.style.opacity = "1";
    dp.parentElement.style.display = "table";
    dp.style.width = parent.offsetWidth + "px";
}

/**
 * Hides all open datepickers. Document click event will close any open datepicker, but opening a second datepicker on a second field will not close the first. This function ensures that only one datepicker is open at one time by scanning the DOM for all datepicker tables and hiding them
 */
function hideAllOpen() {
    $(".datePickerTab").each(function (i, el) {
        hideDatepicker(el.id);
    });
}

//? START HERE
/**
 * Create a datepicker calendar with an empty table nested under an input element
 * @param {string} dp ID of the table that will be populated with datepicker elements 
 * @param {HTMLInputElement} parent The source element for datepicker 
 */
function createDatepicker(dp, parent) {
    dp = document.getElementById(dp);
    createHeader(dp); /*Create the header FIRST, then get the elements that were created*/
    var dpID = dp.id;
    var nextMo = document.getElementById(dpID + "-nextMonth_exclude");
    var prevMo = document.getElementById(dpID + "-prevMonth_exclude");
    var nextYr = document.getElementById(dpID + "-nextYear_exclude");
    var prevYr = document.getElementById(dpID + "-prevYear_exclude");

    hideAllOpen();
    showDP(dp, parent); //Make visible, set width
    createRows(dp);//Populate with empty <tr> and <td>
    getMonthAndYear(dpID); //Get the current month/year
    getDaysOfMonth(dpID, parent); //Populate dp with days based on given month/year

    /*Handle events*/
    $(document).click(function () {
        hideDatepicker(dp.id);
    });
    $(parent).focus(function () {
        cancelEvent();
    });
    $(parent).click(function () {
        cancelEvent();
    });
    $(dp).click(function () {
        cancelEvent();
    });
    /*Navigate dp */
    $(nextMo).unbind().click(function () {
        nextMonth(dpID, parent);
    });
    $(prevMo).unbind().click(function () {
        prevMonth(dpID, parent);
    });
    $(prevYr).unbind().click(function () {
        prevYear(dpID, parent);
    });
    $(nextYr).unbind().click(function () {
        nextYear(dpID, parent);
    });
}

//Add multiple onload events by calling this and passing it the function(s) you want to call
function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function () {
            if (oldonload) {
                oldonload();
            }
            func();
        }
    }
}

//Used to find indexOf value in an array
addLoadEvent(function () {
    //Compatibility mode threw an error on indexOf() - fix straight from mozilla
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
    if (!Array.prototype.indexOf) Array.prototype.indexOf = (function (Object, max, min) {
        "use strict";
        return function indexOf(member, fromIndex) {
            if (this === null || this === undefined) throw TypeError("Array.prototype.indexOf called on null or undefined");

            var that = Object(this), Len = that.length >>> 0, i = min(fromIndex | 0, Len);
            if (i < 0) i = max(0, Len + i); else if (i >= Len) return -1;

            if (member === void 0) {
                for (; i !== Len; ++i) if (that[i] === void 0 && i in that) return i; // undefined
            } else if (member !== member) {
                for (; i !== Len; ++i) if (that[i] !== that[i]) return i; // NaN
            } else for (; i !== Len; ++i) if (that[i] === member) return i; // all else

            return -1; // if the value was not found, then return -1
        };
    })(Object, Math.max, Math.min);
});