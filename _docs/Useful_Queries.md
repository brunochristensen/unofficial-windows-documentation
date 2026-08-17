## Process queries

### Windows processes to file write locations

I'm attempting to normalize values like usernames and GUIDs as part of the directory path.
This particular query is configured to baseline certain Windows processes.
If using this to hunt for anomalies, I would remove/edit the /desktop, /documents, and 
/downloads filter, and add another WHERE filter after the normalization.
	
```
FROM logs-*
| WHERE process.name == <processname>
  AND event.action == "FileCreate"
  AND host.name == <hostname>
  AND NOT (
    OR TO_LOWER(file.directory) LIKE """*\\desktop\\*"""
    OR TO_LOWER(file.directory) LIKE """*\\desktop"""
    OR TO_LOWER(file.directory) LIKE """*\\documents\\*"""
    OR TO_LOWER(file.directory) LIKE """*\\documents"""
    OR TO_LOWER(file.directory) LIKE """*\\downloads\\*"""
    OR TO_LOWER(file.directory) LIKE """*\\downloads"""
  )
// Normalize Windows username
| EVAL normalized_directory =
    REPLACE(
      file.directory,
      """C:\\Users\\[^\\]+""",
      """C:\\Users\\<user>"""
    )
// Normalize GUIDs
| EVAL normalized_directory =
    REPLACE(
      normalized_directory,
      """\{[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}\}""",
      """<GUID>"""
    )
// Normalize IE cache IDs
| EVAL normalized_directory =
    REPLACE(
      normalized_directory,
      """\\IE\\[A-Za-z0-9]{8}(?=\\|$)""",
      """\\IE\\<CACHE_ID>"""
    )
// Normalize Outlook Content.Outlook cache IDs
| EVAL normalized_directory =
    REPLACE(
      normalized_directory,
      """\\INetCache\\Content\.Outlook\\[A-Za-z0-9]{8}(?=\\|$)""",
      """\\INetCache\\Content.Outlook\\<CACHE_ID>"""
    )
// Normalize OICE temporary directories
| EVAL normalized_directory =
    REPLACE(
      normalized_directory,
      """\\OICE_[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}\.[0-9]+(?=\\|$)""",
      """\\<OICE_TEMP>"""
    )
// Normalize Microsoft IdentityCache user IDs
| EVAL normalized_directory =
    REPLACE(
      normalized_directory,
      """\\u_[A-Za-z0-9]{16}(?=\\|$)""",
      """\\<IDENTITY_USER>"""
    )
// Normalize Microsoft IdentityCache entity IDs
| EVAL normalized_directory =
    REPLACE(
      normalized_directory,
      """\\e_[A-Za-z0-9]{16}(?=\\|$)""",
      """\\<IDENTITY_ENTITY>"""
    )
// Normalize Microsoft IdentityCache resource IDs
| EVAL normalized_directory =
    REPLACE(
      normalized_directory,
      """\\r_[A-Za-z0-9]{16}(?=\\|$)""",
      """\\<IDENTITY_RESOURCE>"""
    )
| STATS directories = VALUES(normalized_directory) BY process.executable
| LIMIT 100
```