---
title: "GigiDuru"
description: "Outlook 2010 drops a file named gigiduru into Temp and deletes it milliseconds later. Here is why."
---

## How it started

Anyone with even a cursory knowledge of cybersecurity is acutely aware of email attack vectors. Email compromise is still incredibly common, in part because it's so easy. So naturally mail servers and email applications on endpoints are always something to keep an eye on.

This all started when working with a mission partner that made extensive use of old and outdated software and equipment. Like domain controllers running on Windows Server 2012, a handful of Windows Server 2008, third-party modifications to outdated mail server software. Very fun stuff.

The bulk of users were still on classic Outlook. Outlook will generate a file creation event when a user downloads a file sent as an attachment. EDR agents, especially those with machine learning models that detect unusual parent-child processes and file writes, can provide some decent insight into Outlook activity, barring any specific integrations. In this case, we use dashboards to keep an eye on various behaviors Outlook exhibits. File creation events with binary file extensions, or multiple file extensions, are something we keep a running feed on. Events like the ones below are something we would see pop up.

First, Sysmon Event ID 11 -- the file being created:

```
File created:
RuleName: -
UtcTime: 2026-06-03 12:22:36.076
ProcessGuid: {F9A4EECA-161B-6A7B-1801-00000000EF01}
ProcessId: 5952
Image: C:\Program Files (x86)\Microsoft Office\Office14\OUTLOOK.EXE
TargetFilename: C:\Users\[AVeryNiceGentleman]\AppData\Local\Temp\gigiduru.0.docx
CreationUtcTime: 2026-06-03 12:22:36.076
```

Then the same file three milliseconds later, from the EDR. Note `event.action`:

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

> [!NOTE]
> It's perfectly normal for Outlook to create files. Lots of programs create files. I create files. Not a lot of things create `.docx` files in `C:\Users\<username>\AppData\Local\Temp\`. For those who aren't aware, let me explain why this is concerning.

The first thing that is odd here is where the file is being created. It's not unusual for Outlook to create files in `\AppData\Local\Temp\`. Google reveals quite a few users reporting Outlook dumping rather large log files to that location when logging is misconfigured. As far as I am aware there is no Windows product that generates logs in `.docx` format (yet). Per the Microsoft support page, Outlook is going to write user customization settings primarily to `C:\Users\<username>\AppData\Local\Microsoft` and `C:\Users\<username>\AppData\Roaming\Microsoft`.

Another red flag stems from the temporal analysis, which is a fancy way of saying that this file exists for 3 milliseconds before being deleted. I would entertain the possibility that somehow a user managed to download a mailed document to `C:\Users\<username>\AppData\Local\Temp`, but that timespan clearly indicates this file creation and deletion was programmatic.

Lastly, Microsoft Office documents can execute macros. Specifically, older OLE file types like `.doc`, `.xls`, and `.ppt` can include VBA macros natively. Newer OOXML files (`.docx`, `.xlsx`, and `.pptx`) generally don't have macros unless the file extension is tagged with an 'm' (`.docm`, `.xlsm`, and `.pptm`). I don't generally take a file extension at face value, but I also happen to know that even APTs can be pretty lazy when it comes to obfuscation when they think nobody is looking. IAmLegionVaal on GitHub has a neat little writeup about this that goes into more detail. Link in the Sources section.

All this taken into account, I am now concerned that this is some payload delivery mechanism I've stumbled across. So I start documenting the process execution chain, tracing my PIDs, start looking to see if any new EDR alerts have fired. Here's what I discovered:

## What I discovered

There are a lot of files being generated and immediately deleted named `gigiduru`. I spent a good 3 hours looking into this. Outlook just does this.

I'm being hyperbolic when I say Outlook does this. It turns out that only classic Outlook 2010 does this, but the actual code still has fragments of this behavior even in current versions. I found other users running nearly every version of Outlook on this network, and only Office 2010 was observed doing this. I now have a nice collection of file creation events in `C:\Users\<username>\AppData\Local\Temp` with filenames prepended with `gigiduru`, followed by immediate deletion.

## Whip out the Ghidra

A quick string search of `gigiduru` will reveal the string is only referenced in one function:

```c
void FUN_1405779a8(char *pszProgIdOrPattern,LPSTR pszIconPath,undefined4 cchIconPath,
                  undefined4 *piIconIndex)

{
  LSTATUS regStatus;
  undefined4 pstrKey;
  int iResolved;
  DWORD cchTempPath;
  HANDLE hTempFile;
  undefined1 *pszDefaultIconKey;
  longlong cchRemaining;
  char *pszScan;
  CHAR *pszIconClsid;
  undefined1 auStack_428 [32];
  char *keySuffixOrCreationDisp;
  undefined4 dwFlagsAndAttributes;
  undefined8 templateFileArg;
  undefined4 argSlot8_zero;
  LONG regValueSizes [2];
  undefined1 *strDefaultIconKey [2];
  undefined8 ehState;
  CHAR szClsid [48];
  CHAR szAutoConvertClsid [48];
  CHAR szProgIdOrTempFile [272];
  char szExtension [256];
  CHAR szClsidKeyPath [272];
  ulonglong securityCookie;
  char ch;
  
  ehState = 0xfffffffffffffffe;
  securityCookie = (ulonglong)auStack_428 ^ 0x2b992ddfa23249d6;
  FUN_1401eb724(strDefaultIconKey);
  regValueSizes[1] = 0x104;
  if (*pszProgIdOrPattern == '*') {
    strncpy_s(szExtension,0x100,pszProgIdOrPattern,0xffffffffffffffff);
    szExtension[0] = '.';
    regStatus = RegQueryValueA((HKEY)0xffffffff80000000,szExtension,szProgIdOrTempFile,
                               regValueSizes + 1);
    if (regStatus == 0) {
      pszProgIdOrPattern = szProgIdOrTempFile;
      goto LAB_140577a60;
    }
  }
  else {
    szExtension[0] = '\0';
LAB_140577a60:
    pstrKey = FUN_140021c60(strDefaultIconKey,pszProgIdOrPattern);
    FUN_14000eab0(pstrKey,0x6b65627a);
    pstrKey = FUN_140099e68(strDefaultIconKey,s_\DefaultIcon_141561140,0xffffffff);
    FUN_14000eab0(pstrKey,0x6b656361);
    pszDefaultIconKey = &DAT_14106175a;
    if (strDefaultIconKey[0] != (undefined1 *)0x0) {
      pszDefaultIconKey = strDefaultIconKey[0];
    }
    iResolved = FUN_140940bf8(pszDefaultIconKey,pszIconPath,cchIconPath,piIconIndex);
    if (iResolved != 0) goto LAB_140577c8b;
    iResolved = FUN_1409411b4(pszProgIdOrPattern,szClsid,0x29);
    if (iResolved != 0) {
      regValueSizes[0] = 0x29;
      keySuffixOrCreationDisp = s_\AutoConvertTo_141561150;
      FUN_1401ee898(szClsidKeyPath,0x104,"CLSID\\%s%s",szClsid);
      regStatus = RegQueryValueA((HKEY)0xffffffff80000000,szClsidKeyPath,szAutoConvertClsid,
                                 regValueSizes);
      pszIconClsid = szAutoConvertClsid;
      if (regStatus != 0 || regValueSizes[0] < 0xb) {
        pszIconClsid = szClsid;
      }
      keySuffixOrCreationDisp = s_\DefaultIcon_141561140;
      FUN_1401ee898(szClsidKeyPath,0x104,"CLSID\\%s%s",pszIconClsid);
      iResolved = FUN_140940bf8(szClsidKeyPath,pszIconPath,cchIconPath,piIconIndex);
      if (iResolved != 0) goto LAB_140577c8b;
    }
  }
  *pszIconPath = '\0';
  *piIconIndex = 0;
  cchRemaining = -1;
  pszScan = szExtension;
  do {
    if (cchRemaining == 0) break;
    cchRemaining = cchRemaining + -1;
    ch = *pszScan;
    pszScan = pszScan + 1;
  } while (ch != '\0');
  if ((int)cchRemaining != -2) {
    cchTempPath = GetTempPathA(0x104,szProgIdOrTempFile);
    if (cchTempPath == 0) {
      GetCurrentDirectoryA(0x104,szProgIdOrTempFile);
    }
    Ordinal_5540("gigiduru",szProgIdOrTempFile,0x104);
    Ordinal_5540(szExtension,szProgIdOrTempFile,0x104);
    argSlot8_zero = 0;
    templateFileArg = 0;
    dwFlagsAndAttributes = 0x100;
    keySuffixOrCreationDisp = (char *)CONCAT44(keySuffixOrCreationDisp._4_4_,1);
    hTempFile = (HANDLE)Ordinal_511(szProgIdOrTempFile,0x80000000,0,0);
    if (hTempFile != (HANDLE)0xffffffffffffffff) {
      FindExecutableA(szProgIdOrTempFile,"",pszIconPath);
      CloseHandle(hTempFile);
      DeleteFileA(szProgIdOrTempFile);
    }
  }
LAB_140577c8b:
  thunk_FUN_1400067e4(strDefaultIconKey);
  FUN_1401fde94(securityCookie ^ (ulonglong)auStack_428);
  return;
}
```

Variables and function calls have been renamed for clarity, but I'm not going to claim these are entirely accurate. This function first looks for the file type's icon in the registry, trying `HKCR\<ProgId>\DefaultIcon`, then the class's `CLSID\{guid}\DefaultIcon`. (The `(HKEY)0xffffffff80000000` in the listing above is `HKEY_CLASSES_ROOT`.) If both of those fail, it creates the temporary `gigiduru` file with the requested extension and calls `FindExecutableA`, which returns the path to the executable associated with that extension -- Outlook then pulls the icon out of that binary. `Ordinal_511` is likely a `CreateFileA` wrapper in MSO.dll; `Ordinal_5540` is a string append, called twice to build `gigiduru` plus the extension onto the temp path. So this is all just to find a display icon for a file based on its extension, in the case where the registry doesn't have the correct entries to resolve a path.

## What's funny about this

I did actually find out some stuff about `gigiduru` when doing research into the initial alert. Trend Micro has a report referencing the gigiduru file as an IOC pertaining to the Vidar and RedLine infostealers. But what I find funny is that whatever engineer at Microsoft solved the problem of finding file icons did it in one of the most suspicious ways possible. Theoretically, if someone were to send an `.exe` file, you would see a `gigiduru` executable quickly appear and disappear in a temp folder, spawned by Outlook. Again, if I didn't have a good EDR product in place enabling better insight into that process, I would be very concerned.

I'd be curious as to the possibility of leveraging this behavior to identify malicious attachments, or at least files with unusual extensions. I do think this would require some more investigation as to why registry entries for common Office extensions were failing to retrieve proper icon paths, and thus triggering this behavior. This would probably require sandboxing, but given that this version of Office isn't available to download legally anymore, I'd have to go find another route. And I'm not paying for an Office license.

It should be noted that the `gigiduru` string is still present in Office 16 Outlook, and I believe in New Outlook as well, but there are no longer functions making reference to those strings.

Hope this answers someone's question.

Sources:

[support.microsoft.com/en-us/outlook/find-and-transfer-outlook-data-files-from-one-computer-to-another](https://support.microsoft.com/en-us/outlook/find-and-transfer-outlook-data-files-from-one-computer-to-another)

[github.com/IAmLegionVaal/Malicious-Word-Macro-Attack-Chain-Research](https://github.com/IAmLegionVaal/Malicious-Word-Macro-Attack-Chain-Research)

[www.trendmicro.com/en_us/research/23/i/redline-vidar-first-abuses-ev-certificates](https://www.trendmicro.com/en_us/research/23/i/redline-vidar-first-abuses-ev-certificates)