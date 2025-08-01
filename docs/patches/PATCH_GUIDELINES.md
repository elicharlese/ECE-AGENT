# Patch Guidelines

## What is a Patch?
A patch is a small, focused change that addresses:
- Bug fixes
- Minor feature additions
- Performance improvements
- Code cleanup
- Documentation updates

## Patch Workflow

### 1. Create Patch Folder
```bash
mkdir docs/patches/patch-{n}
```

### 2. Required Files
Each patch folder must contain:
- `PATCH{n}_CHECKLIST.md` - Tasks and requirements
- `PATCH{n}_SUMMARY.md` - What was changed and why

### 3. Patch Numbering
- Start with `patch-1` and increment sequentially
- Use zero-padding for patches >99: `patch-001`

### 4. Checklist Template
Each checklist should include:
- [ ] Problem identified
- [ ] Solution designed
- [ ] Code changes implemented
- [ ] Tests updated/added
- [ ] Documentation updated
- [ ] Performance impact assessed
- [ ] Reviewed and approved

### 5. Summary Template
Each summary should include:
- **Problem**: What issue was addressed
- **Solution**: How it was solved
- **Changes**: List of modified files
- **Impact**: Performance/behavior changes
- **Testing**: How it was validated

## Best Practices
- Keep patches small and focused
- One patch per logical change
- Clear, descriptive commit messages
- Update relevant documentation
- Test thoroughly before merging
