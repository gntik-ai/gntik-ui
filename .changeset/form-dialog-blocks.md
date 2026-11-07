---
'@gntik-ai/blocks': patch
---

CreateApiKeyDialog and InviteMembersDialog now run on FormDialog with the same props: the error alert moves to the top of the body, and a parent-driven close resets the fields.
