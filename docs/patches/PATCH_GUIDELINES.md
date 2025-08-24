# Patch Guidelines

## What is a Patch?

A patch is a small, focused change that addresses:

- Bug fixes
- Minor feature additions
- Performance improvements
- Code cleanup
- Documentation updates

## Patch Workflow

### 1. Identify Feature

Determine which feature your patch relates to by checking the feature directories in `docs/patches/patch_feature/`.

### 2. Create Patch Folder

```bash
mkdir docs/patches/patch_feature/{feature-name}/patch-{feature-patch-n}
```

### 3. Required Files

Each patch folder must contain:

- `PATCH_CHECKLIST.md` - Tasks and requirements
- `PATCH_SUMMARY.md` - What was changed and why

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

## Feature-Based Organization

Patches are organized by feature in `docs/patches/patch_feature/`. Each feature has its own directory:

### Feature Directories

- `admin_login` - Authentication and admin security features
- `responsive_ui` - UI components and responsive design
- `mobile_desktop_consistency` - Cross-platform design consistency
- `nx_routing` - Nx workspace and routing configuration
- `test_coverage` - Testing implementation and expansion
- `zod_validation` - Runtime validation with Zod schemas
- `ci_cd_deployment` - Deployment pipeline and automation
- `documentation_mapping` - Documentation organization and tracking

## Best Practices

- Keep patches small and focused
- One patch per logical change
- Clear, descriptive commit messages
- Update relevant documentation
- Test thoroughly before merging
- Organize patches by feature directory structure
- Map patch files to END_GOAL.md requirements
