Readme
# [Tech Spec](https://docs.google.com/document/d/1FO5PcL_R236KUmY901Lc4h92SAoSIxJIAkwF5WplnZo/edit?usp=sharing)
[Figma Link](https://www.figma.com/design/N8Q00w6TLsnGxO5LXaWV52/diaryPrototype?node-id=2-3&t=cDieDvGjqWhkkp8W-1)

Style Guide:
Run `npx eslint src/**` on command line before committing!

IDE: Download [Jetbrains Webstorm](https://www.jetbrains.com/webstorm/download/#section=mac)

[Base React Style Guide](https://airbnb.io/javascript/react/)

[Base Typescript Style Guide](https://google.github.io/styleguide/tsguide.html)

When running test suites, npm run mock is roughly 4 times faster on average than using npm run test that runs all tests using in-memory and the mocks. This statistic also accounts for the fact npm run test also runs the mock tests and the 4 times faster is accurate. This is what we expected due to the nature of mocked data not requiring actual sending/retrieval of data.

