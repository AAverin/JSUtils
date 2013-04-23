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