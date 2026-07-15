const { withPodfile } = require('@expo/config-plugins');

/**
 * Xcode 26's Clang enforces stricter C++20 consteval rules that the `fmt`
 * pod version currently vendored by React Native doesn't satisfy, causing
 * "call to consteval function ... is not a constant expression" build
 * failures (tracked upstream: facebook/react-native#55601,
 * expo/expo#44229). Compiling just the `fmt` pod against C++17 skips the
 * consteval code path entirely and fixes the build without touching any
 * other target. This has to be a config plugin (not a direct ios/Podfile
 * edit) because EAS Build regenerates ios/ from app.json on every cloud
 * build via its own `expo prebuild` step.
 *
 * Must run AFTER react_native_post_install(...) in the generated Podfile —
 * that helper resets CLANG_CXX_LANGUAGE_STANDARD to c++20 across pod
 * targets, so inserting before it (as an earlier version of this plugin
 * did) gets silently overwritten.
 */
module.exports = function withFmtCxx17Fix(config) {
  return withPodfile(config, (config) => {
    const marker = "target.name == 'fmt'";
    if (config.modResults.contents.includes(marker)) {
      return config;
    }

    const insertion = `
    installer.pods_project.targets.each do |target|
      if target.name == 'fmt'
        target.build_configurations.each do |bc|
          bc.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'gnu++17'
        end
      end
    end
`;

    const callPattern = /(react_native_post_install\(\s*installer,\s*config\[:reactNativePath\],[\s\S]*?\n\s*\))/;
    if (!callPattern.test(config.modResults.contents)) {
      throw new Error(
        'withFmtCxx17Fix: could not find react_native_post_install(...) call in the generated Podfile to anchor the fmt C++17 fix after.',
      );
    }

    config.modResults.contents = config.modResults.contents.replace(
      callPattern,
      `$1\n${insertion}`,
    );

    return config;
  });
};
