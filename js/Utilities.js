/*
    Utilities.js
    
    Author: David Cole
    Date: 9/24/2008
    
    Description: Contains helper functions for client side operations.
        Defines the Utilities client side namespace.
*/

// Namespacing Object
var Utilities;

if (Utilities == null || Utilities == 'undefined')
    Utilities = new Object();

Utilities.Pair = function(key, value)
{
    this.key = ((!key && key != 0) ? new Object() : key);
    this.value = ((!value && value != 0) ? new Object() : value);
}

Utilities.Pair.prototype =
{
    equals: function(pair)
    {
        return (this.key == pair.key && this.value == pair.value);
    }
}

// Determines whether or not the specified string ends with the specified substring.
// Returns true if the specified string does end with the specified substring, and false
// if it does not.
//
// Parameters:
// text: The string to search against.
// subString: The string to search for.
Utilities.StringEndsWith = function(text, subString)
{
    var regex = new RegExp(subString + '$');
    
    return regex.test(text);
}

// Gets the top and left positions of an Html object in the form
// of x and y coordinates.
//
// Parameters:
// element: The Html object whose x and y coordinates are to be
//      retrieved.
Utilities.getXY = function(element)
{
    if (!element)
    {
        return null;
    }

    var position = new Object();
    position.x = element.offsetLeft;
    position.y = element.offsetTop;

    var parent = element.offsetParent;

    while (parent != null)
    {
        position.x += parent.offsetLeft;
        position.y += parent.offsetTop;

        parent = parent.offsetParent;
    }

    return position;
}

Utilities.isOpera = function()
{
    return (navigator.userAgent.toLowerCase().indexOf("opera") != -1);
}

// Cross browser friendly method for retrieving an xmlDoc object
//
// Parameters:
// contentLoader: An XmlHttpResponse object created using the net.js library functions.
Utilities.xmlDoc = function(contentLoader)
{
    var xml = null;

    if (window.ActiveXObject)
    {
        xml = new ActiveXObject("Msxml.DOMDocument");
        if (contentLoader.req)
            xml.loadXML(contentLoader.req.responseText);
    }
    else
    {
        var xmlParser = new DOMParser();
        if (contentLoader.req)
            xml = xmlParser.parseFromString(
                contentLoader.req.responseText, "text/xml");
    }

    return xml;
}

Utilities.parseXmlToObject = function(contentLoader, rootElementName)
{
    // create a collection object
    var list = new Array();
    var xmlDoc = new Utilities.xmlDoc(contentLoader);

    var elements = xmlDoc.getElementsByTagName(rootElementName);

    for (var i = 0; i < elements.length; i++)
    {
        var elementRoot = elements[i];

        var item = new Utilities.Content();

        if (elementRoot)
        {
            for (var j = 0; j < elementRoot.childNodes.length; j++)
            {
                // fix for Firefox Xml Document
                if (elementRoot.childNodes[j].nodeName == "#text")
                    continue;

                var element = new Utilities.Pair();

                element.key = elementRoot.childNodes[j].nodeName;
                element.value = (elementRoot.childNodes[j].text != null) ? elementRoot.childNodes[j].text : elementRoot.childNodes[j].textContent;

                if (elementRoot.childNodes[j].attributes.length > 0)
                {
                    element.attributes = new Utilities.Content();

                    for (var k = 0; k < elementRoot.childNodes[j].attributes.length; k++)
                    {
                        var attrib = elementRoot.childNodes[j].attributes[k];
                        element.attributes.add(new Utilities.Pair(attrib.name, attrib.value));
                    }
                }

                item.add(element);
            }
        }

        list.push(item);
    }

    return list;
}

Utilities.countInstancesOf = function(substr, text)
{
    var count = 0;

    for (var i = 0; i < text.length; i++)
    {
        if (text.substr(i, substr.length) == substr)
            count++;
    }

    return count;
}

Utilities.doKey = function(e)
{
    var keyCode = -1;

    if (window.event)
        keyCode = event.keyCode;
    else
        keyCode = e.which;

    if (keyCode == 13)          // Enter
    {
        return false;
    }

    return true;
}

Utilities.isNetscape = function()
{
    return (navigator.appName.indexOf('Netscape') != -1);
}

Utilities.splitString = function(delimiter, text)
{
    var arr = new Array();
    var temp = text.toString();
    var count = Utilities.countInstancesOf(delimiter, text);
    
    var index = temp.indexOf(delimiter, 0); 
    arr.push(temp.substring(0, ((index != -1) ? index : temp.length)));
    temp = temp.substring((index != -1) ? index + 1 : temp.length);
    
    for(var i = 0; i < count; i++)
    {
        index = temp.indexOf(delimiter, 0);
        arr.push(temp.substring(0, ((index != -1) ? index : temp.length)));
        temp = temp.substring((index != -1) ? index + 1 : temp.length);   
    } 
    
    return arr;
}

Utilities.ApplymouseoverRow = function(table, method)
{
    for (var i = 1; i < table.rows.length; i++)
        table.rows[i].onmouseover = method;
}

Utilities.ApplyonRowClick = function(table, method)
{
    for (var i = 1; i < table.rows.length; i++)
        table.rows[i].onclick = method;
}

Utilities.ValidateFloatingPointInput = function(control, minValue, maxValue, method)
{
    control.onkeypress =
    function(e)
    {
        var keyCode = -1;
        var src;

        if (method)
        {
            var obj = method(control, minValue, maxValue);

            if (obj)
            {
                if (obj.control)
                    control = obj.control;
                if (obj.minValue || obj.minValue == 0)
                    minValue = obj.minValue;
                if (obj.maxValue || obj.maxValue == 0)
                    maxValue = obj.maxValue;
            }
        }

        if (window.event)
        {
            keyCode = event.keyCode;
            src = event.srcElement;
        }
        else
        {
            keyCode = e.which;
            src = e.target;
        }

        var chr = String.fromCharCode(keyCode);

        if ((chr == "" || chr == null) ||
            (chr == '.' && src.value.indexOf('.') == -1))
        {
            return true;
        }

        if (isNaN(Utilities.parseNum(chr)) && chr != '-')
        {
            return false;
        }

        if (minValue || minValue == 0)
        {
            if (minValue < 0)
            {
                if (chr == '-')
                    return src.value.indexOf('-') == -1;
            }

            if (parseFloat(src.value + chr.toString()) < minValue)
            {
                src.value = minValue;
                return false;
            }
        }
        else
        {
            if (chr == '-')
                return false;
        }

        if (maxValue || maxValue == 0)
        {
            if (parseFloat(src.value + chr.toString()) > maxValue)
            {
                src.value = maxValue;
                return false;
            }
        }

        return true;
    };
    
    control.onchange =
    function(e)
    {
        var src;

        if (method)
        {
            var obj = method(control, minValue, maxValue);

            if (obj)
            {
                if (obj.control)
                    control = obj.control;

                if (obj.minValue || obj.minValue == 0)
                    minValue = obj.minValue;

                if (obj.maxValue || obj.maxValue == 0)
                    maxValue = obj.maxValue;
            }
        }

        if (window.event)
            src = event.srcElement;
        else
            src = e.target;

        var num = Utilities.parseFloat(src.value);

        if (isNaN(num))
        {
            src.value = '';
            return true;
        }

        if (minValue || minValue == 0)
        {
            if (num < minValue)
                src.value = minValue;
        }

        if (maxValue || maxValue == 0)
        {
            if (num > maxValue)
                src.value = maxValue;
        }

        return true;    
    };
}

Utilities.ValidateIntegerInput = function(control, minValue, maxValue, method)
{
    control.onkeypress =
    function(e)
    {
        var keyCode = -1;
        var src;

        if (method)
        {
            var obj = method(control, minValue, maxValue);

            if (obj)
            {
                if (obj.control)
                    control = obj.control;

                if (obj.minValue || obj.minValue == 0)
                    minValue = obj.minValue;

                if (obj.maxValue || obj.maxValue == 0)
                    maxValue = obj.maxValue;
            }
        }

        if (window.event)
        {
            keyCode = event.keyCode;
            src = event.srcElement;
        }
        else
        {
            keyCode = e.which;
            src = e.target;
        }

        if (keyCode == 0 || keyCode == 8)
            return true;

        var chr = String.fromCharCode(keyCode);

        if (chr == "" || chr == null)
        {
            return true;
        }

        if (isNaN(Utilities.parseNum(chr)) && chr != '-')
        {
            return false;
        }

        if (minValue || minValue == 0)
        {
            if (minValue < 0)
            {
                if (chr == '-')
                    return src.value.indexOf('-') == -1 && src.value.length == 0;
            }

            if (chr == '-')
                return false;

            if (parseInt(src.value + chr.toString()) <= minValue)
            {
                src.value = minValue;
                return false;
            }
        }
        else
            if (chr == '-')
            return src.value.indexOf('-') == -1 && src.value.length == 0;

        if (maxValue || maxValue == 0)
        {
            if (parseInt(src.value + chr.toString()) >= maxValue)
            {
                src.value = maxValue;
                return false;
            }
        }

        return true;
    };

    control.onchange =
    function(e)
    {
        var src;

        if (method)
        {
            var obj = method(control, minValue, maxValue);

            if (obj)
            {
                if (obj.control)
                    control = obj.control;

                if (obj.minValue || obj.minValue == 0)
                    minValue = obj.minValue;

                if (obj.maxValue || obj.maxValue == 0)
                    maxValue = obj.maxValue;
            }
        }

        if (window.event)
        {
            keyCode = event.keyCode;
            src = event.srcElement;
        }
        else
        {
            keyCode = e.which;
            src = e.target;
        }

        var num = Utilities.parseInt(src.value);

        if (isNaN(num))
        {
            src.value = '';
            return true;
        }

        if (minValue || minValue == 0)
        {
            if (num < minValue)
                src.value = minValue;
        }

        if (maxValue || maxValue == 0)
        {
            if (num > maxValue)
                src.value = maxValue;
        }

        return true;
    }
}

Utilities.parseInt = function(text, defaultVal)
{
    if (!text || text == "")
        return (defaultVal || defaultVal == 0) ? defaultVal : NaN;

    var num = 0;
    
    for (var i = text.length - 1; i >= 0; i--)
    {
        var val = Utilities.parseNum(text.charAt(i));

        if (isNaN(val))
            return (defaultVal || defaultVal == 0) ? defaultVal : val;

        num += (val * Math.pow(10, ((text.length - 1) - i)));
    }

    return num;
}

Utilities.parseFloat = function(text, defaultValue)
{    
    if (!text || text == '')
        return (defaultVal || defaultVal == 0) ? defaultVal : NaN;
        
    var decimalPosition = text.indexOf('.');
    
    var wholePartText = (decimalPosition != -1) ? 
                        text.substring(0, decimalPosition) :
                        text;
    var fractPartText = (decimalPosition != -1) ?
                        text.substring(decimalPosition + 1) :
                        '0';
    
    var wholePart = Utilities.parseInt(wholePartText);
   
    if (isNaN(wholePart))
        return (defaultValue || defaultValue == 0) ? defaultValue : NaN;
   
    var fractPart = 0;
         
    for (var i = 0; i < fractPartText.length; i++)
    {
        var num = Utilities.parseNum(fractPartText.charAt(i));
        
        if (isNaN(num))
            return (defaultValue || defaultValue == 0) ? defaultValue : NaN;
        
        fractPart += (num * (Math.pow(10, (i + 1) * -1)));
    }
    
    return wholePart + fractPart;
}

// Accepts a single character value and returns its single digit numeric
// equivalent
//
// Parameters:
// @chr: The single character value to be parsed.
Utilities.parseNum = function(chr)
{
    switch (chr)
    {
        case '0':
            return 0;
        case '1':
            return 1;
        case '2':
            return 2;
        case '3':
            return 3;
        case '4':
            return 4;
        case '5':
            return 5;
        case '6':
            return 6;
        case '7':
            return 7;
        case '8':
            return 8;
        case '9':
            return 9;
        default:
            return NaN;
    }
}

Utilities.ValidateUpperCaseText = function(control)
{
    control.onkeypress =
    function(e)
    {
        var keyCode = -1;
        var src;

        if (window.event)
        {
            keyCode = event.keyCode;
            src = event.srcElement;
        }
        else
        {
            keyCode = e.which;
            src = e.target;
        }
    }

    if (keyCode == 0 || keyCode == 8)
        return true;

    var chr = String.fromCharCode(keyCode);

    if (chr == "" || chr == null)
    {
        return true;
    }

    chr = Utilities.toUpper(chr);

    src.value += chr;

    return false;
}

Utilities.toUpper = function(chr) {
    if (!chr || chr.length != 1)
        return chr;

    if (chr >= 'a' && chr <= 'z')
        return chr - 32;

    return chr;
}

Utilities.ValidateFromRegEx = function(control, expression, length)
{
    var regEx = new RegExp(expression);
    if (isNaN(length))
        length = -1;

    control.onkeypress =
    function(e)
    {
        var keyCode = -1;
        var src;

        if (window.event)
        {
            keyCode = event.keyCode;
            src = event.srcElement;
        }
        else
        {
            keyCode = e.which;
            src = e.target;
        }

        if (keyCode == 0 || keyCode == 8)     // The user pressed Backspace or Delete
            return true;

        var chr = String.fromCharCode(keyCode);

        if (chr == "" || chr == null)
        {
            return true;
        }

        return regEx.test(chr) && (length < 0 || src.value.length < length);
    }

    control.onchange =
    function(e)
    {
        var src;

        if (window.event)
            src = event.srcElement;
        else
            src = e.target;

        for (var i = 0; i < src.value.length; i++)
            if (!regEx.test(src.value.charAt(i)))
            {
                src.value = src.value.replace(src.value.charAt(i), '');
                i--;
            }
    }
}

Utilities.trim = function(str)
{
	var whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
	for (var i = 0; i < str.length; i++) {
		if (whitespace.indexOf(str.charAt(i)) == -1) {
			str = str.substring(i);
			break;
		}
	}
	for (i = str.length - 1; i >= 0; i--) {
		if (whitespace.indexOf(str.charAt(i)) == -1) {
			str = str.substring(0, i + 1);
			break;
		}
	}
	return whitespace.indexOf(str.charAt(0)) == -1 ? str : '';
}

Utilities.showObject = function(ctrl)
{
    if (!ctrl)
        return false;

    ctrl.style.display = 'block';
}

Utilities.hideObject = function(ctrl)
{
    if (!ctrl)
        return false;

    ctrl.style.display = 'none';
}

Utilities.toTextArray = function(content)
{
    var text = new String();
    text = '{';

    if (content.Collection)
    {
        var isPair = false;
        var isContent = false;

        if (content.length() >= 1)
        {
            item = content.elementAt(0);

            if (item.key)               // The element is of type "Pair"
            {
                isPair = true;
                text += item.key + ':' + item.value.toString().replace('&', '%26');
            }
            else if (item.Collection)   // The element is of type "Content"
            {
                isContent = true;
                text += Utilities.toTextArray(item);
            }
            else                        // The element is of some other type not defined in this file, treat it like a primitive.
            {
                text += item.toString().replace('&', '%26');
            }
        }

        for (var i = 1; i < content.length(); i++)
        {
            var item = content.elementAt(i);

            text += ',' + ((isPair) ? (item.key + ':' + item.value.toString().replace('&', '%26')) : (isContent) ? Utilities.toTextArray(item) : item.toString());
        }
    }
    else
    {
        if (content.length && content.length >= 1)
        {
            text += content[0].toString().replace('&', '%26');

            for (var i = 1; i < content.length; i++)
                text += ',' + content[i].toString().replace('&', '%26');
        }
    }

    text += '}';
    
    return text;
}

Utilities.ToDotNetDateTimeString = function(date)
{
    if (!typeof(date) == Date)
        return "01/01/0001 00:00:00";

    var dateString = new String();

    dateString = (date.getMonth() + 1).toString() + '/';
    dateString += date.getDate().toString() + '/';

    if (!Utilities.isNetscape())
        dateString += date.getYear().toString() + ' ';
    else
        dateString += date.getYear().toString().substring(1, 3) + ' ';

    dateString += date.getHours().toString() + ':';
    dateString += date.getMinutes().toString() + ':';
    dateString += date.getSeconds().toString();

    return dateString;
}

Utilities.createImage = function(imageUrl, altText) {
    var img = document.createElement('img');
    
    img.src = imageUrl;
    img.alt = altText;
    
    return img;
}

Utilities.getDimensions = function(domObject)
{
    var dimensions = new Object();
    dimensions.width = parseInt(domObject.style.width.substring(0, domObject.style.width.length - 2));
    dimensions.height = parseInt(domObject.style.height.substring(0, domObject.style.height.length - 2));
    return dimensions;
}

Utilities.calculateXYforChildCenterAlign = function(container, child)
{
    coordinates = new Object();
    var parentDimensions = (container.getDimensions) ? container.getDimensions() : Utilities.getDimensions(container);
    var childDimensions = (child.getDimensions) ? child.getDimensions() : Utilities.getDimensions(child);
    coordinates.y = (parentDimensions.height / 2) - (childDimensions.height / 2);

    coordinates.x = (parentDimensions.width / 2) - (childDimensions.width / 2);

    return coordinates;
}

