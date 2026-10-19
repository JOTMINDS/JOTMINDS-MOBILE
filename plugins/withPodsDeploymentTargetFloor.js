const { withPodfile } = require('@expo/config-plugins');

/**
 * Xcode 27 (the current EAS "latest" iOS image) refuses to build any target
 * whose IPHONEOS_DEPLOYMENT_TARGET is below 15.0:
 *
 *   error: The iOS deployment target 'IPHONEOS_DEPLOYMENT_TARGET' is set to
 *   9.0, but the range of supported deployment target versions is 15.0 to
 *   27.1.x. (in target 'RNCAsyncStorage-RNCAsyncStorage_resources')
 *
 * @react-native-async-storage/async-storage 1.23.1 declares iOS 9.0 in its
 * podspec when the New Architecture is off, and CocoaPods gives its
 * privacy-manifest *resource bundle* the same target. React Native's own
 * ReactNativePodsUtils.updateOSDeploymentTarget only walks
 * pod_target_installation_results (the pods' main targets), so resource-bundle
 * targets keep the podspec's value.
 *
 * This raises every Pods-project target below the app's own minimum (15.1) to
 * 15.1. It never lowers anything, and a pod can't run on a device older than
 * the app anyway, so there is no behavioural change.
 *
 * Like withFmtCxx17Fix this has to be a config plugin (EAS regenerates ios/
 * from app.json on every cloud build) and must run after
 * react_native_post_install(...).
 */
module.exports = function withPodsDeploymentTargetFloor(config) {
  return withPodfile(config, (config) => {
    const marker = 'Xcode 27 rejects deployment targets below 15.0';
    if (config.modResults.contents.includes(marker)) {
      return config;
    }

    const insertion = `
    # ${marker} (plugins/withPodsDeploymentTargetFloor.js)
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |bc|
        if bc.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < 15.1
          bc.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
        end
      end
    end
`;

    const callPattern = /(react_native_post_install\(\s*installer,\s*config\[:reactNativePath\],[\s\S]*?\n\s*\))/;
    if (!callPattern.test(config.modResults.contents)) {
      throw new Error(
        'withPodsDeploymentTargetFloor: could not find react_native_post_install(...) call in the generated Podfile to anchor the deployment-target floor after.',
      );
    }

    config.modResults.contents = config.modResults.contents.replace(
      callPattern,
      `$1\n${insertion}`,
    );

    return config;
  });
};
