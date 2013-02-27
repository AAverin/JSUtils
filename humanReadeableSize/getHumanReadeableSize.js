/**
* @Author Anton Averin, a.a.averin@gmail.com
*
* Function to format sizes properly
* Note: (see http://en.wikipedia.org/wiki/Mebibyte)
* 'bi'-bytes - bytes of the base 2. Ex: 1Mib = 1 mebibyte = 2^20 = 1,048,576 bytes
* bytes - bytes of the base 10. Ex: 1Mb = 1 megabyte = 10^6 = 1,000,000 bytes
*
* Supports both Gib and Gb format types and can convert from one to another
*
* input/output format is: 
* <sizePrefix>i(optional)b
* sizePrefix is one of these: ' KMGTPEZYXWVU'
* 'i' points that we use 'bi' format
* b is the usual 'bytes' postfix
*
* by default format is set to 'bi', so if no formats are passed - we assume bytes are on the input and mebibites(Mib) or gibibytes(Gib) something larger will be in result
*
* @param data - integer number for conversion
* @param inputFormat - input conversion format
* @param outputFormat - output conversion format
*
* @return float - result of conversion to human readeable format rounded to 2nd significan digit after decimal point
*
* Usecases:
* getHumanReadableSize(14240780288) - converts '14240780288' bytes to the closest possible value > 0, that will be 13.3Gib
* getHumanReadableSize(14240780288, '', ' b') - assumes that 'bi'-bytes are inputed and are converted to bytes, so it will output 14.2Gb
* getHumanReadableSize(14240780288, 'Kib', ' b') - assumes that Kibibytes were inputed and should be converted to the closes possible value > 0 and into bytes, that will be 14.2Tb
* getHumanReadableSize(14240780288, 'Kib', '') - assumes that Kibibytes were inputed and should be converted to the closes possible value > 0 and into 'bi'-bytes, that will be 13.3Tib
* getHumanReadableSize(14240780288, 'Kib', 'Gb') - assumes that Kibibytes were inputed and should be converted to Gigabytes, that will be 14241Gb
* getHumanReadableSize(14240780288, 'Kib', 'Gib') - assumes that Kibibytes were inputed and should be converted to Gigabytes, that will be 13581Gb
* getHumanReadableSize(14240780288, 'Gib', 'Kib') - assumes that Gibibytes were inputed and should be converted to Kibibytes, that will be 14932540431269888Kib
*/
var humanReadableFormatRegexp = new RegExp('(\\s|\\w)i?(b|B)');
getHumanReadableSize = function(data, inputFormat, outputFormat) {
    //fix formats
    if (!inputFormat || inputFormat && !humanReadableFormatRegexp.test(inputFormat)) {
        inputFormat = " iB";
    }

    if (!outputFormat || outputFormat && !humanReadableFormatRegexp.test(outputFormat)) {
        outputFormat = " iB";
    }
	
	var byteLetter = outputFormat[outputFormat.length - 1];

    var defaults = {
        sizePrefixes: ' KMGTPEZYXWVU',
        inputIndex: 0,
        outputIndex: -1,
        inputBase: 1000,
        outputBase: 1000
    };

    var options = $.extend(defaults, {
        inputIndex: defaults.sizePrefixes.indexOf(inputFormat.charAt(0)),
        outputIndex: defaults.sizePrefixes.indexOf(outputFormat.charAt(0)),
        inputBase: (inputFormat.indexOf("i") != -1) ? 1024 : 1000,
        outputBase: (outputFormat.indexOf("i") != -1) ? 1024 : 1000
    });

    return function() {
        if (!data || data <= 0) {
			//return 0 in case of no data
            return '0 ' + byteLetter;
        }

		//calculate the number of times we should divide our initial data by inputBase to round to the closes significant value of sizePrefixes
        var powShiftCount = 0;
        if (options.outputIndex <= 0) {
            powShiftCount = Math.min(Math.floor(Math.log(data)/Math.log(options.inputBase)), options.sizePrefixes.length - 1);
        } else {
            powShiftCount = options.outputIndex - options.inputIndex;
        }

        //make the actual rounding calculation
        var result = ((data * 100 / Math.pow(options.outputBase,  powShiftCount)) / 100);
        var toSignificantNumber = 0;
        //if the resulting number is fixed integer - no further rounding needed
        if (result % 1 != 0)  {
            //otherwise, round to the closes significant number after the decimal point + 2 points for precision
            toSignificantNumber = Math.round((-Math.log(Math.abs(result)) / Math.LN10) + 2);
        }
        //if significant number turned out to be < 0, eg. if we were not rounding down but making Megabytes from Gigabytes - don't round
        toSignificantNumber = toSignificantNumber < 0 ? 0 : toSignificantNumber;
        //return data in '10 GB' format
        return result.toFixed(toSignificantNumber) + ' ' +
            options.sizePrefixes.charAt(powShiftCount + options.inputIndex).replace(' ', '') + (options.outputBase === 1024 ? 'i' + byteLetter : byteLetter);
    }();
};