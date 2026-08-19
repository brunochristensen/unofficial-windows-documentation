# GigiDuru, and why I write this blog

## How it started

So as I'm sure anyone who done any investigation into an endpoint is acutly aware of email attack vectors. Phishing has been the number one way to compromise a network for as long as I can remember. So naturally mail servers and email applications on endpoints are always something I keep an eye on.

I was working with mission partner that made extensive use of old an outdated software an equipment. Like domain controllers running on Windows Server 2012, a handful of Windows Server 2008, third-party modifications to outdated mail server software... Very fun stuff.

So when I see the events below pop up on one of my dashboards, I suddenly have some questions.

```
File created:
RuleName: -
UtcTime: 2025-06-03 12:22:36.076
ProcessGuid: {F9A4EECA-161B-6A7B-1801-00000000EF01}
ProcessId: 5952
Image: C:\Program Files (x86)\Microsoft Office\Office14\OUTLOOK.EXE
TargetFilename: C:\Users\[AVeryNiceGentleman]\AppData\Local\Temp\gigiduru.0.docx
CreationUtcTime: 2026-06-03 12:22:36.076
```

```json
{
  ...
  "fields": {
    "file.path": [
      "C:\\Users\\[AVeryNiceGentleman]\\AppData\\Local\\Temp\\gigiduru.0.docx"
    ],
    "event.category": [
      "file"
    ],
    "process.pid": [
      5952
    ],
    "user.name": [
      "[AVeryNiceGentleman]"
    ],
    "process.executable": [
      "C:\\Program Files (x86)\\Microsoft Office\\Office14\\OUTLOOK.EXE"
    ],
    "message": [
      "Endpoint file event"
    ],
    "event.action": [
      "deletion"
    ],
    "@timestamp": [
      "2026-06-03T12:22:36.079Z"
    ],
	...
  }
  ...
}
```

[!INFO]
It's perfectly normal for Outlook to create files. Lots of programs create files. I create files. Not a lot of thing create .docx files in C:\Users\User\AppData\Local\Temp\. For those who arn't aware, let me explain why this is concerning. 

The first thing that is odd is where the file is being created. It's not unusual for Outlook to create files in \AppData\Local\Temp\. Google reveals quite a few users reporting Outlook dumping rather large log files to that location when logging is misconfigured. As far as I am aware there is no Windows product that generates logs in .docx format (yet). Per the microsoft support page Outlook is going to write user customization seetings primarily to C:\Users\<username>\AppData\Local\Microsoft and C:\Users\<username>\AppData\Roaming\Microsoft. 

Another red flag stems from the temporal analysis, which is a fancy way to saying that this file exists for 3 miliseconds before being deleted. I would entertain the possibilitly that somehow a user managed to download a mailed document to C:\Users\<username>\AppData\Local\Temp, but that timespan clearly indicates this file creation and deletion was programatic. 

Lastly, Microsoft Office documents can execute macros. Specifically older OLE file types like .doc, .xls, and .ppt can include VBA macros nativly. New OOXML files (.docx, .xlsx and .pptx) generally don't have macros unless the file extension is tagged with an 'm' (.docm, .xlsm and .pptm). I don't generally take file extension at face value, but I also happen to know that even APT's can be pretty lazy when it comes to obfucation when they think nobody is looking. IAmLegionVaal on Github has a neat little writeup about this that goes into more in more detail. Link in the Sources section.

[!INFO]
File extension are a suggestion.

All this taken into account, I am now concerned that I am in the middle stages of malware execution, and this is some payload delivery mechanism I've stumbled across. So I start documenting the process execution chain, tracing my PIDs, start looking to see if any new EDR alerts have popped off. Here's what I discovered:

## What I discovered 

Nothing. There was nothing. I spent a good 3 hours looking this. Outlook just does this.

I'm being hyperbolic when I say Outlook does this. I turns out that just Outlook 2010 does this. I know this because I found other users running nearly every version of Outlook on this network, and only Office 2010 was observed doing this. I now have a nice collection of file creation events in C:\Users\<username>\AppData\Local\Temp with filenames prepended with `gigiduru`, followed by imidiate deletion.

So now I'm curious what the purpose of this behavior is.

## Whip out the Ghidra


Sources:

support.microsoft.com/en-us/outlook/find-and-transfer-outlook-data-files-from-one-computer-to-another

github.com/IAmLegionVaal/Malicious-Word-Macro-Attack-Chain-Research