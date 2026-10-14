# Version and release policy

The source of truth is package.json; VERSION, the UI version and the matching vMAJOR.MINOR.PATCH tag must agree. Every verified improvement within this VI line increments PATCH by one and has a separate descriptive commit and CHANGELOG entry. New major identity/system revisions deliberately change MINOR or MAJOR; never move or reuse a published tag.

Keep commits linear and preserve the repository history. Never force-push published branches. Record what changed, verification performed and material limitations. A tag points to the exact source used for the release archive. Publish the GitHub Release only after checks pass and the matching tag is pushed.

CI runs on pushes and pull requests. Generated archives are release/build artifacts and are not source-controlled. No tokens, environment files or local credentials belong in source or release archives.
