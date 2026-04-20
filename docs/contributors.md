# Contributors

Sort Playground displays contributor information from each algorithm's `meta.json`.

Important rule:

- `author`
- every entry in `contributors`

should be the contributor's GitHub username, not a display name.

Example:

```json
{
  "author": "octocat",
  "contributors": ["octocat", "another-user"]
}
```

This is required because the UI builds GitHub profile links and avatar/icon URLs from those values.

## Official Contributor

Official sorts use:

```json
{
  "author": "T-1234567890",
  "contributors": ["T-1234567890"]
}
```

The GitHub profile is:

```text
https://github.com/T-1234567890
```

## Avatar Rules

Avatars are static GitHub image URLs:

```text
https://github.com/{username}.png
```

There are no GitHub API calls.

If an avatar fails to load, the UI falls back to initials.

## About Page

The About page lives at:

```text
/about
```

It describes:

- the project concept
- the design direction
- the static build approach
- official maintainer information

## Repository

Project repository:

```text
https://github.com/T-1234567890/sort-playground
```
