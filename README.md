# Welcome to JSUtils

Welcome to JSUtils wiki page.

JSUtils is a set of javascript utilities of various sorts that were written by me during my work on different projects.

## ArrayTreeWalker

If you have a tree that is made of arrays, then you can walk that structure using ArrayTreeWalker.
Here is the example of such data structure. 
And, BTW, you can have regexps in there. You will just need a proper processing function for them to work.

```
#!javascript

[Root,
      [SubRoot1]
      ...
      [SubRoot5,
          SubRoot5_element1, SubRoot5_element2, ... , SubRoot5_elementN]
      ...
      [SubRootN]
]
```

The basic idea is that you can invoke some *process* method for each of the elements in the structure. If that *process* method returns *false* - processing is stopped.
Each node yields *true* only if any leaf is true.
So, for example, SubRoot5 processing will yield *true* only if any SubRoot5_elementN yields *true*.
If node doesn't have leafs, node processing result will equal to that node result.

```
#!javascript

walkArrayTree = function(array, callback, options)
```

@array - tree array array to walk through. **Can have regexps**

@callback - *process* function to call for each element

@options - *not used for now*


@return **[result, [index]]**. result is *true|false* depending on the results of *process* function called for each element. **index** is an array of indexes where function returned true.

### Example

So, enough with a general description, lets go through an example and some explanation.


The idea to write this plugin came to me when I got a task to validate a phone number, specifically if phonenumber is from the set of supported counties, where each country can have specific detailed rules to check on.


In [this wiki article](http://en.wikipedia.org/wiki/List_of_country_calling_codes) you can find the list of different country codes.

That list can be represented as a tree, where:
- first level node is Zone
- second level node is first phone number (+1, +2 etc)
- and other nodes are country phone numbers


So, let's say your project support all generic phonenumber, like US, Europe, Eurasia, Africa. But with Europe you need to be a bit more specific, because you need to support Denmark, for example, and Denmark has additional rules that apply for a phonenumber - it has a prefix of +45 and can have only 8 numbers after that.


A test should pass for all generic countries, and should pass for Denmark, but shouldn't pass if we provide wrong Denmark number.


For those unpatient [here is a JsFiddle to play with](http://jsfiddle.net/AAverin/2nuuV/). Just change *testNumber* variable.


So, let's represent our test requirements? How about this data structure?

```
#!javascript

var supportedCountryRegexp =
        [/^[1-9]{1}\d+/, /*World*/
            [/^1(\d{10})+$/ /*US*/],
            [/^2(\d{1,3})?\d+/ /*Africa*/],
            [/^(3|4)\d+/, /*EU*/
                /^45\d{8}$/ /*Denmark*/, /^(?!45)\d+$/ /*Other EU countries*/],
            [/^5(\d{1,3})?\d+/ /*Latin America*/],
            [/^6\d+/ /*Southeast Asia and Oceania*/],
            [/^7\d+/ /*Eurasia (former Soviet Union)*/],
            [/^8\d+/ /*East Asia and Special Services*/],
            [/^9\d+/ /*Central, South and Western Asia*/]
        ];
```

We made a set of rules that will pass for all generic countries, and also provided some specifics for Denmark.
I know that for 1 country test only this may be a bit of an overkill, but imagine if you have 100 countries with 100 rules to check?


Now, let's make a processing function

```
#!javascript

var processRegexTreeElement = function(number) {
        return function(index, element) {
            return element.test(number);
        };
    };
```

It's a simple regexp test.

This particular processing function uses *currying* to inject a number, and returns a function that will be always aware of the *number* variable. That function will be executed for each tree element, and will have *index* and *element* passed.
As soon as each *element* we have is a regexp we can just test our number on that and return the result.

If result will be *false* processing will stop and we will not walk the whole long tree, thus not consume processor time. Otherwise we'll search until we find a match.

The idea here is that script will process leaves only if node returns *true*. In case of our example, if regexp for EU numbers **/^(3|4)\d+/** passes - we will try to match number with Denmark regexp **/^45\d{8}$/**

And, well, that's all.
You can walk any array-tree you want.
In my project I added this check into *jquery.validate.additional-methods.js* of **Jquery validate tools**, with some additional checks for phone numbers and use it to validate input fields.

Send me a note if you find an interesting way to use my script!

## humanReadeableSize

This is a simple javascript method that allows to format sizes properly. Implementation was heavily influenced by discussion in [this Stackoveflow thread](http://stackoverflow.com/questions/4498866/actual-numbers-to-the-human-readable-values) and, especially, Amir's example. Regards to the way rounding to significant number after decimal point works goes to [this post](http://www.dacris.com/blog/2011/09/09/javascript-code-snippet-round-to-significant-digits/)

The common problem of size formatting in UI is that backend may return size in any format. Usually it's in bytes, but it can return MB(Megabytes), GB(Gigabytes), or MiB(Mibibytes) and GiB(Gibibytes).
To better understand what is this 'iB' format check [this Wikipedia article](http://en.wikipedia.org/wiki/Mebibyte).

Speaking shortly, in MiB/GiB we display sizes that are calculated in the base of 2, so the step is 1024 bytes.

1MiB = 1024B, 1GiB = 1024MiB

In MB/GB format we display sizes that are of the base of 10, so the step is 1000

1MB = 1000B, 1GB = 1000MB

The purpose of the utility is to convert between these different formats, and also round the sizes properly.
You can pass in *14240780288* into the **getHumanReadableSize** method and get 13.3 GiB as a result.

Or point that the data is in KiB and you want GB in the output: 

```
#!javascript

getHumanReadableSize(14240780288, 'KiB', 'GB')
```
which will output *14241 GB*

Method supports following size postfixes:
' KMGTPEZYXWVU'
Kilo, Mega, Giga, Teta, Peta, ..., etc

Now to some details of how to use the method.

Signature is getHumanReadableSize(number_to_format, inputFormat, outputFormat)
**inputFormat** and **outputFormat** correspond to this regexp: *(\\s|\\w)i?(b|B)*

so it's something like ' iB' or 'Mb' or 'GiB'.

By default method assumes that if no input/output formats were passed, then we use a ' iB' format - so we expect 'bi'-bytes on the input and display a closet 'bi'-byte value in the output.
You can provide any formats you want.

**inputFormat** tells the method in what format **number_to_format** was passed. So if you pass a long number and you know, that it's not in bytes, but in Megabytes - call getHumanReadableSize(your_number, 'Mb')

For example:

```
#!javascript

getHumanReadableSize(1234567890, 'MB') = "1.15 PiB"
```

**outputFormat** looks exactly the same, as inputFormat, and describes what do you expect to get in the result. 

If you omit outputFormat it will be replaced with ' iB', telling that you expect number_to_format to be reduced to the closest fixed size value possible, and that you want number_to_format to be converted to the base of 2 (1024B per KB).

Of course, you can pass outputFormat explicitly, and method will convert your number to the passed format.

```
#!javascript

getHumanReadableSize(1234567890, 'MB', 'KB') = "1234567890000 KB"
getHumanReadableSize(1234567890, 'MB', 'KiB') = "1264197519360 KiB"
getHumanReadableSize(1234567890, 'MB', 'TiB')  = "1177 TiB"
```


## WKHTMLTOPDF Table split hack

WkHtmlToPdf table splitting hack. 
The idea of the script goes to Florin Stancu *<niflostancu@gmail.com>*

**Problem**: we have a really long table in HTML and we convert that HTML to PDF using [WkHtmlToPdf][http://wkhtmltopdf.googlecode.com/].
wkhtmltopdf will probably split your HTML to pages himself, but it doesn't always looks good. 
You could add `page-break-before: always;` where you want manually to insert a page break.
But what if you want to display a custom header on each new splitted page? wkhtmltopdf doesn't support that yet.
So the only solution is to split pages manually, add these pagebreaks and also add custom headers to new splitted tables.
This is where this script becomes handy.


An intellectual script that splits tables from your html page into a multiple-page pdf layout.
Script is optimized to leverage large amounts of data, so splitting into 100+ pages should be much of a problem.

The idea is quite simple.
- First you set pdf page settings using pdfInfo object.
- Then you mark all tables that you want splitted by class that is set in splitClassName variable. (and a good idea here is to mark all tables at splittable, but ignore some of them)
- after that it would be good to modify splitThreshold variable so it would be ~ the same as your tr height.

One of the script features is that it supports showing custom headers on splitted pages. 
Use the provided code as an example to modify your splitted header and tables that you will ignore for splitting and just move to another page.
In the code, `'tr.heading1'` is used as a header, and class `'page-split'` is added to it when such row is the new page table header. Also, `'ellipsis'` are added before such row
`'chart'` classes that have `splitClassName` class set are ignored in the code and splitted to a new page automatically.
Feel free to modify the code to use suitable to you class names.

So, what the script does is that it just goes through all of the tables classed with what is set in  splitClassName variable, checks row height and compares it to the calcualated pdf page height. If row doesn't fit - it's splitted into the new page.
Splitting logic is done in the memory, so all modifications are shown after we finish processing a particular table - that allows to process even really large tables quite fast.

This is the first version of the script, so in the future it might become more generic and easier to use, but for now feel free to dive into code and make changes yourself. 

BTW, I didn't had time to properly test that, but as soon as wkhtmltopdf doesn't support showing `<thead>` on each new splitted page, this functionality should be actually achieveable using this script - just change that `'tr.heading1'` to `'thead'` and modify the code appropriately.

Oh, and yea, almost forgot.
To use this script don't forget to insert it into the HTML you generate PDF's from=)

### A few tips for wkhtmltopdf
- don't use semi-transparent elements (with opacity < 0) for elements on your pdfs - generating semi-transparent elements takes ~2 times longer.

Dependencies: jQuery.