import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { parseDeepLink } from '../utils/deepLinks';

/**
 * Turns invite/code links into a pre-filled sign-up or student-code sign-in.
 * Only acts for signed-out users; a signed-in user tapping a link is left alone.
 * Renders nothing. Must live inside <NavigationContainer>.
 */
export default function DeepLinkHandler() {
  const navigation = useNavigation<any>();
  const { user, loading } = useAuth();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (loading || user) return;
    const handle = (url: string | null) => {
      if (!url || handled.current === url) return;
      const link = parseDeepLink(url);
      if (!link) return;
      handled.current = url;
      if (link.kind === 'student-code') navigation.navigate('Login', { studentCode: link.code });
      else navigation.navigate('Signup', { role: link.role, organizationCode: link.code });
    };
    Linking.getInitialURL().then(handle).catch(() => {});
    const sub = Linking.addEventListener('url', (e) => handle(e.url));
    return () => sub.remove();
  }, [loading, user, navigation]);

  return null;
}
