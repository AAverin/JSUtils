## WKHTMLTOPDF Table Splitting Hack

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

Dependencies: jQuery.