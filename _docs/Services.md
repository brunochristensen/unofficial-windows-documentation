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

## Let's explore .msc files and snap-ins for a second...

Here is a top-level look at `services.msc`:

### .msc XML breakdown

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

Most of this information is related to the visual appearance of the console pane. But there are two element that I find interesting: `<ConsoleFileID>`, `<ScopeTree>`, and `<BinaryStorage>`. You can explore your own .msc files in C:\Window\System32. In order to better explore how these file are used, we should look at `mmc.exe`.

## mmc.exe

I decompiled mmc.exe in Ghidra to better explore the behavior of `mmc.exe`, and how it relates to .msc files. The `<ConsoleFileID>` GUID is only refenced once in the `mmc.exe` binary, and not in the registry, or anywhere else I can find. It appears to be stamped into the .msc/.xml file upon creation. Below is the code snippet in which "ConsoleFileID" is referenced. Everytime an .msc file is created, it will be stamped with a new guid.

```C++
  GUID guidConsoleFileId;
  ...
  if (pPersistor[0x18] == (SC)0x0) { #This is either checking that the data stream is in a valid state, or write permission are present.
	...
    guidConsoleFileId.Data1 = 0; #GUID struct being initialized
    guidConsoleFileId.Data2 = 0;
    guidConsoleFileId.Data3 = 0;
    guidConsoleFileId.Data4[0] = '\0';
    guidConsoleFileId.Data4[1] = '\0';
    guidConsoleFileId.Data4[2] = '\0';
    guidConsoleFileId.Data4[3] = '\0';
    guidConsoleFileId.Data4[4] = '\0';
    guidConsoleFileId.Data4[5] = '\0';
    guidConsoleFileId.Data4[6] = '\0';
    guidConsoleFileId.Data4[7] = '\0';
    HVar3 = CoCreateGuid(&guidConsoleFileId); # Creates GUID from combaseapi.h
    mmcerror::SC::operator=(sc,HVar3); # Verifies the GUID is valid
    bVar2 = mmcerror::SC::operator_bool(sc);
    if (bVar2) {
      mmcerror::SC::Throw(sc);
    }
    CPersistor_EnterChildElement # Writes the new GUID
              (&xmlConsoleFileIdElem,(longlong *)pPersistor,(longlong **)L"ConsoleFileID",
               (wchar_t *)0x0);
    persistValueType = (wchar_t *)CONCAT44(persistValueType._4_4_,0xc);
    pPersistValueData = (longlong **)&guidConsoleFileId;
    CPersistor_PersistContents((longlong *)&xmlConsoleFileIdElem,(int *)&persistValueType);
    CPersistor_ReleaseInterfaces((longlong *)&xmlConsoleFileIdElem);
  }
```

At the very end of the file is a `<BinaryStorage>` attribute. The zero-based index of the sub elements is referenced with the `BinaryRefIndex=` attribute seen within other xml elements, namely `<ScopeTree>` (I'll come back to `<ScopeTree>` in a second, I promise).

### <BinaryStorage>

```XML
  <BinaryStorage>
	<Binary Name="CONSOLE_FILE_ICON_LARGE">
    <Binary Name="CONSOLE_FILE_ICON_SMALL">
    <Binary>
    <Binary>
    <Binary>
	  ECcAAAQAAAABAAAAAgAAAAAA
    </Binary>
    <Binary>
    <Binary>
    <Binary>
  </BinaryStorage>
```

`mmc.exe` decodes this using the function ScDecodeBinary. I have a Python script that will reverse this at github.com/brunochristensen/msc-binary-decode.

```C++
SC * ScDecodeBinary(SC *pscRet,longlong *pstrBase64Text,undefined8 *pXmlBinaryOut)
{
  ulonglong uVar1;
  bool bVar2;
  short sVar3;
  uint uVar4;
  SC *pSVar5;
  long lVar6;
  longlong lVar7;
  byte bVar8;
  uint uVar9;
  int iVar10;
  int iVar11;
  void *_Dst;
  byte bVar12;
  short *psVar13;
  byte bVar14;
  char cVar15;
  undefined8 quadAccumulator;
  void *pWriteCursor;
  SC scTemp [24];
  uint cbPredictedSize;
  SC binaryLock [8];
  undefined8 *pXmlBinaryRef;
  int *pTlsInitCounter;
  void *pDecodeBufferStart;
  
  mmcerror::SC::SC(pscRet,0);
  mmcerror::SC::SetFunctionName(pscRet,(ushort *)L"ScDecodeBinary");
  uVar4 = FUN_140013b9c(pstrBase64Text);
  if (uVar4 < 0xc800001) {
    uVar4 = uVar4 * 6 + 7;
    uVar9 = uVar4 >> 3;
    lVar6 = -0x7ff8ffa9;
    if (pXmlBinaryOut != (undefined8 *)0x0) {
      lVar6 = 0;
    }
    cbPredictedSize = uVar9;
    mmcerror::SC::SC(binaryLock,lVar6);
    mmcerror::SC::operator=(pscRet,binaryLock);
    mmcerror::SC::~SC(binaryLock);
    bVar2 = mmcerror::SC::operator_bool(pscRet);
    if (!bVar2) {
      pSVar5 = FUN_140013da8(pXmlBinaryOut,scTemp);
      mmcerror::SC::operator=(pscRet,pSVar5);
      mmcerror::SC::~SC(scTemp);
      bVar2 = mmcerror::SC::operator_bool(pscRet);
      if (bVar2) {
        mmcerror::SC::TraceAndClear(pscRet);
      }
      if (uVar4 >> 3 != 0) {
        pSVar5 = CXMLBinary_ScAlloc(pXmlBinaryOut,scTemp,(ulonglong)uVar9);
        mmcerror::SC::operator=(pscRet,pSVar5);
        mmcerror::SC::~SC(scTemp);
        binaryLock[0] = (SC)mmcerror::SC::operator_bool(pscRet);
        if (!(bool)binaryLock[0]) {
          quadAccumulator = (void *)0x0;
          pXmlBinaryRef = pXmlBinaryOut;
          CXMLBinaryLock_ScLockWorker((char *)binaryLock,scTemp,&quadAccumulator);
          mmcerror::SC::operator=(pscRet,scTemp);
          mmcerror::SC::~SC(scTemp);
          bVar2 = mmcerror::SC::operator_bool(pscRet);
          if (!bVar2) {
            lVar6 = 0;
            pWriteCursor = quadAccumulator;
            if (quadAccumulator == (void *)0x0) {
              lVar6 = -0x7fff0001;
            }
            mmcerror::SC::SC(scTemp,lVar6);
            mmcerror::SC::operator=(pscRet,scTemp);
            mmcerror::SC::~SC(scTemp);
            bVar2 = mmcerror::SC::operator_bool(pscRet);
            if (!bVar2) {
              pDecodeBufferStart = quadAccumulator;
              psVar13 = (short *)*pstrBase64Text;
              pTlsInitCounter = (int *)(*(longlong *)ThreadLocalStoragePointer + 4);
              _Dst = quadAccumulator;
              do {
                iVar11 = 0;
                iVar10 = 0;
                quadAccumulator = (void *)((ulonglong)quadAccumulator & 0xffffffff00000000);
                lVar7 = 0;
                if ((*pTlsInitCounter < DAT_14017bcf8) &&
                   (FUN_140058790(&DAT_14017bcf8), _Dst = pWriteCursor, DAT_14017bcf8 == -1)) {
                  FUN_14004ccfc();
                  _Init_thread_footer(&DAT_14017bcf8);
                }
                sVar3 = *psVar13;
                bVar8 = 0;
                bVar14 = 0;
                cVar15 = '\0';
                bVar12 = 0;
                if (sVar3 != 0) {
                  do {
                    iVar10 = iVar11;
                    if ((3 < lVar7) || (sVar3 == 0x3d)) break;
                    psVar13 = psVar13 + 1;
                    if ((&g_abBase64DecodeTable)[(byte)sVar3] != -1) {
                      *(undefined *)((longlong)&quadAccumulator + lVar7) =
                           (&g_abBase64DecodeTable)[(byte)sVar3];
                      iVar11 = iVar11 + 1;
                      lVar7 = lVar7 + 1;
                    }
                    sVar3 = *psVar13;
                    iVar10 = iVar11;
                  } while (sVar3 != 0);
                  bVar8 = quadAccumulator._2_1_;
                  bVar14 = quadAccumulator._1_1_;
                  cVar15 = (char)quadAccumulator;
                  bVar12 = quadAccumulator._3_1_;
                }
                uVar1 = (ulonglong)quadAccumulator;
                quadAccumulator._3_5_ = SUB85(uVar1,3);
                quadAccumulator._0_3_ =
                     CONCAT12(bVar8 << 6 | bVar12,
                              CONCAT11(bVar8 >> 2 | bVar14 << 4,bVar14 >> 4 | cVar15 << 2));
                iVar11 = iVar10 + -1;
                if (0 < iVar11) {
                  memcpy(_Dst,&quadAccumulator,(longlong)iVar11);
                  _Dst = pWriteCursor;
                }
                if (iVar10 == 0) {
                  iVar11 = 0;
                }
                _Dst = (void *)((longlong)_Dst + (longlong)iVar11);
                pWriteCursor = _Dst;
              } while (iVar10 == 4);
              pSVar5 = FUN_140013bc4((char *)binaryLock,scTemp);
              mmcerror::SC::operator=(pscRet,pSVar5);
              mmcerror::SC::~SC(scTemp);
              bVar2 = mmcerror::SC::operator_bool(pscRet);
              if (bVar2) {
                mmcerror::SC::TraceAndClear(pscRet);
              }
              uVar4 = (int)_Dst - (int)pDecodeBufferStart;
              if (uVar4 != cbPredictedSize) {
                if (uVar4 == 0) {
                  pSVar5 = FUN_140013da8(pXmlBinaryOut,scTemp);
                  mmcerror::SC::operator=(pscRet,pSVar5);
                }
                else {
                  pSVar5 = FUN_1400f7c34(pXmlBinaryOut,scTemp,(ulonglong)uVar4);
                  mmcerror::SC::operator=(pscRet,pSVar5);
                }
                mmcerror::SC::~SC(scTemp);
                mmcerror::SC::operator_bool(pscRet);
              }
            }
          }
          CXMLBinaryLock_Destructor((char *)binaryLock);
        }
      }
    }
  }
  else {
    if (((undefined **)PTR_LOOP_140170350 != &PTR_LOOP_140170350) &&
       (2 < (byte)PTR_LOOP_140170350[0x19])) {
      FUN_14005cd38(*(undefined8 *)(PTR_LOOP_140170350 + 0x10),0xf,&DAT_1401350d0);
    }
    mmcerror::SC::operator=(pscRet,-0x7ff8ffa9);
  }
  return pscRet;
}
```

Most of the data in `<BinaryStorage>` is icons for the management console. Additionally, there is state data about the console itelf.

![00_CONSOLE_FILE_ICON_LARGE](/assets/images/services/management/00_CONSOLE_FILE_ICON_LARGE.bmp)
![05_imagelist](/assets/images/services/management/05_imagelist.bmp)

### <ScopeTree>

```XML
  <ScopeTree>
    <SnapinCache>
      <Snapin CLSID="{58221C66-EA27-11CF-ADCF-00AA00A80033}" AllExtensionsEnabled="true"/>
      <Snapin CLSID="{7AF60DD3-4979-11D1-8A6C-00C04FC33566}" AllExtensionsEnabled="true"/>
      <Snapin CLSID="{B1AFF7D0-0C49-11D1-BB12-00C04FC9A3A3}" AllExtensionsEnabled="true"/>
      <Snapin CLSID="{B708457E-DB61-4C55-A92F-0D4B5E9B1224}" AllExtensionsEnabled="true"/>
      <Snapin CLSID="{BD95BA60-2E26-AAD1-AD99-00AA00B8E05A}" AllExtensionsEnabled="true"/>
      <Snapin CLSID="{C96401CC-0E17-11D3-885B-00C04F72C717}" AllExtensionsEnabled="true"/>
    </SnapinCache>
    <Nodes>
      <Node ID="1" ImageIdx="0" CLSID="{C96401CC-0E17-11D3-885B-00C04F72C717}" Preload="false">
        <Nodes>
          <Node ID="3" ImageIdx="0" CLSID="{58221C66-EA27-11CF-ADCF-00AA00A80033}" Preload="true">
            <Nodes/>
            <String Name="Name" ID="5"/>
            <Bitmaps>
              <BinaryData Name="Small" BinaryRefIndex="2"/>
              <BinaryData Name="Large" BinaryRefIndex="3"/>
            </Bitmaps>
            <ComponentDatas>
              <ComponentData>
                <GUID Name="Snapin">{58221C66-EA27-11CF-ADCF-00AA00A80033}</GUID>
                <Stream BinaryRefIndex="4"/>
              </ComponentData>
            </ComponentDatas>
            <Components/>
          </Node>
        </Nodes>
        <String Name="Name" ID="1"/>
        <Bitmaps>
          <BinaryData Name="Small" BinaryRefIndex="5"/>
          <BinaryData Name="Large" BinaryRefIndex="6"/>
        </Bitmaps>
        <ComponentDatas>
          <ComponentData>
            <GUID Name="Snapin">{C96401CC-0E17-11D3-885B-00C04F72C717}</GUID>
            <Stream BinaryRefIndex="7"/>
          </ComponentData>
        </ComponentDatas>
        <Components/>
      </Node>
    </Nodes>
  </ScopeTree>
```

Please note the `BinaryRefIndex=` attributes that reference the before mentioned `<Binary>` elements in `<BinaryStorage>`

> A snap-in is a tool that is hosted in MMC. MMC offers a common framework in which various snap-ins can run so that you can manage several services by using a single interface.
>
> MSDN



<details markdown="1">

<summary>Sources:</summary>

learn.microsoft.com/en-us/troubleshoot/windows-server/system-management-components/what-is-microsoft-management-console

learn.microsoft.com/en-us/previous-versions/windows/desktop/mmc/mmc-3.0/ms692759(v=vs.85)

learn.microsoft.com/en-us/previous-versions/windows/desktop/mmc/reference/ms698449(v=vs.85)

github.com/ZERODETECTION/MSC\_Dropper

elastic.co/security-labs/grimresource

</details>
