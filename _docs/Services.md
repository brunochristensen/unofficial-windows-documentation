---
title: "Services"
description: "How Windows services, services.msc, and the MMC console fit together."
---

The four jobs of an operating system are process, memory, file and I/O management. Services exist as background processes to facilitate more advanced functionality pertaining to these four jobs. Services will implement behavior for functionality like networking functionality, handling API interactions, hosting third-party components and software, etc. Windows will start these processes as a part of its normal start-up routine, and they exist outside of a user context, meaning they don't require a user to start them, and often execute with the highest level of privileged access to the operating system.

## services.msc

Running "Services" from the start menu will actually runs `C:\Windows\System32\services.msc`, This is distinct from `C:\Windows\System32\services.exe`, a.k.a. the Service Control Manager (SCM), which we will get to further down this page.

> [!NOTE]
> It's `services.exe`. `service.exe` is bad, and you should probably remove it.

The .msc extension stands for Microsoft Saved Console. The .msc file type, starting with Windows Vista, is actually XML, and you can open them with notepad in `C:\Windows\System32\` if you want to take a look. The XML defines a console GUI that then can be used to manage underlying Windows system and functionality. In this case, the `services.msc` file contains the configuration for the console window you see. `services.msc`, allows a user to stop, start, and otherwise change the process state of registered services, as well as manipulate some more advanced settings like when a service first starts, what to do if a service crashes, and what permission as service has when it runs. Because these are not binaries or shellcode, .msc files need to ride on another program called `C:\Windows\System32\mcc.exe`.

> MMC also enables you to customize the console. By picking and choosing specific snap-ins, you can create management consoles that include only the administrative tools that you need. For example, you can add tools to manage your local computer and remote computers.
>
> MSDN

### Let's explore .msc files and snap-ins for a second...

Here is a top-level look at `services.msc`:

```xml
<?xml version="1.0"?>
<MMC_ConsoleFile ConsoleVersion="3.0" ProgramMode="UserSDI">
  <ConsoleFileID>{B5F8CB00-9F4F-4195-A8B2-B878313061C6}</ConsoleFileID>
  <FrameState ShowStatusBar="true" LogicalReadOnly="false">
  <Views>
  <VisualAttributes>
  <Favorites>
  <ScopeTree>
  <ConsoleTaskpads/>
  <ViewSettingsCache>
  <ColumnSettingsCache/>
  <StringTables>
  <BinaryStorage>
</MMC_ConsoleFile>
```

The `<ConsoleFileID>` element specifies a GUID for this particular console view. TODO: figure out how this is used

At the very end of the file is a `<BinaryStorage>` attribute. The index of the sub elements is referenced with the `BinaryRefIndex=` attribute. I'm speculating that the body of this `<Binary>` element is likely a serialized "snap-in".

> A snap-in is a tool that is hosted in MMC. MMC offers a common framework in which various snap-ins can run so that you can manage several services by using a single interface.
>
> MSDN

> [!NOTE]
> TODO: Figure out how to decode these possible snap-ins.

## mmc.exe

<details markdown="1">

<summary>Sources:</summary>

learn.microsoft.com/en-us/troubleshoot/windows-server/system-management-components/what-is-microsoft-management-console

learn.microsoft.com/en-us/previous-versions/windows/desktop/mmc/mmc-3.0/ms692759(v=vs.85)

learn.microsoft.com/en-us/previous-versions/windows/desktop/mmc/reference/ms698449(v=vs.85)

github.com/ZERODETECTION/MSC\_Dropper

elastic.co/security-labs/grimresource

</details>
