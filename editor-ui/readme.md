# Osibisty Editor UI

A content editor optimised for a Zettlekasten style note taking with content managed as MD + Front Matter.


## Architecture 

CRDT based live collaboration architecture for syncing to the backend and multiple instances.

CRDT rather than Operational Transformation (OT) because that's what Yjs supports and it's the most mature library I can find to solve for my need.

SlateJS + Yjs

Why build this?

- High partability of content - Don't want content locked into the likes of Notion or Roam.
- Optimised to get out of the way - VS Code + Foam bubble is too clunky, temperamental, and poorly integrated with all the extentions needed to make it work. Not all the extensions are available Codespaces aka via browser
- Access without syncing content locally
- Ability to have search with higjly integrated edit for speed of find/navigating and capturing thoughts/notes.


