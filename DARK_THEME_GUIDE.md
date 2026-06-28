# JotMinds Dark Premium Theme Guide

## Overview

The JotMinds mobile app now features a **Dark Premium Theme** inspired by modern dark UI design patterns while maintaining the JotMinds brand identity. This design creates a sophisticated, premium feel with:

- **Dark backgrounds** (#020618 - deep blue-black)
- **Glassmorphic cards** with semi-transparent dark surfaces
- **JotMinds brand colors** as vibrant accents (Purple, Cyan, Coral)
- **Subtle glows and shadows** for depth
- **Clean typography** with Inter font family

---

## Design System

### Color Palette

#### Base Colors
- **Primary Background**: `#020618` (Very dark blue)
- **Secondary Background**: `#0F172B` (Dark blue)
- **Tertiary Background**: `#1E293B` (Lighter dark blue)

#### Glassmorphic Surfaces
- **Dark Glass**: `rgba(15, 23, 43, 0.8)`
- **Medium Glass**: `rgba(2, 6, 24, 0.5)`
- **Light Glass**: `rgba(30, 41, 59, 0.6)`

#### JotMinds Brand Accents
- **Purple**: `#7C3AED` → `#6D28D9` (Primary accent)
- **Cyan**: `#1FC8E1` → `#0EA5C9` (Secondary accent)
- **Coral**: `#EC4899` → `#DB2777` (Tertiary accent)
- **Success**: `#10B981` → `#059669`

#### Text Colors
- **Primary**: `#FFFFFF` (Pure white)
- **Secondary**: `#CAD5E2` (Light gray-blue)
- **Muted**: `#90A1B9` (Medium gray-blue)
- **Subtle**: `#62748E` (Dark gray-blue)

#### Borders
- **Default**: `#1D293D`
- **Light**: `#314158`
- **Glow**: `rgba(124, 58, 237, 0.2)`

---

## Component Library

### 1. DarkScreenBackground
Full-screen container with dark background.

```tsx
import DarkScreenBackground from '../../components/DarkScreenBackground';

<DarkScreenBackground showImage={true} imageSource={require('./bg.png')}>
  {/* Your content */}
</DarkScreenBackground>
```

**Props:**
- `showImage?: boolean` - Show background image with gradient overlay
- `imageSource?: any` - Image source for background
- `style?: ViewStyle` - Custom styles

---

### 2. DarkGlassCard
Glassmorphic card with semi-transparent background.

```tsx
import DarkGlassCard from '../../components/DarkGlassCard';

<DarkGlassCard 
  variant="dark" 
  padding={24} 
  glowColor="purple"
  onPress={() => {}}
>
  {/* Card content */}
</DarkGlassCard>
```

**Props:**
- `variant?: 'dark' | 'medium' | 'light'` - Glass opacity level
- `padding?: number` - Internal padding (default: 20)
- `glowColor?: 'purple' | 'cyan' | 'none'` - Glow effect color
- `onPress?: () => void` - Make card tappable
- `style?: ViewStyle` - Custom styles

**Variants:**
- **dark**: `rgba(15, 23, 43, 0.8)` - Most opaque
- **medium**: `rgba(2, 6, 24, 0.5)` - Semi-transparent
- **light**: `rgba(30, 41, 59, 0.6)` - Lighter glass

---

### 3. DarkButton
Gradient button with glow effects.

```tsx
import DarkButton from '../../components/DarkButton';

<DarkButton 
  label="Sign In" 
  onPress={handleLogin}
  variant="purple"
  size="large"
  icon="→"
/>
```

**Props:**
- `label: string` - Button text
- `onPress: () => void` - Click handler
- `variant?: 'purple' | 'cyan' | 'coral' | 'success' | 'outline'` - Color scheme
- `size?: 'small' | 'medium' | 'large'` - Button size
- `icon?: string` - Optional icon/emoji
- `disabled?: boolean` - Disabled state

**Sizes:**
- **small**: 40px height
- **medium**: 48px height
- **large**: 56px height (default)

**Variants:**
- **purple**: Purple gradient (primary)
- **cyan**: Cyan gradient (secondary)
- **coral**: Coral gradient (accent)
- **success**: Green gradient
- **outline**: Transparent with border

---

### 4. DarkInput
Input field with icon and glassmorphic background.

```tsx
import DarkInput from '../../components/DarkInput';

<DarkInput
  placeholder="Email Address"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  icon={<Text>✉️</Text>}
  error="Invalid email"
/>
```

**Props:**
- `placeholder: string` - Placeholder text
- `value: string` - Input value
- `onChangeText: (text: string) => void` - Change handler
- `icon?: React.ReactNode` - Left icon
- `secureTextEntry?: boolean` - Password mode with visibility toggle
- `keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'`
- `autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'`
- `error?: string` - Error message

---

## Screen Examples

### Login Screen

```tsx
import DarkScreenBackground from '../../components/DarkScreenBackground';
import DarkGlassCard from '../../components/DarkGlassCard';
import DarkInput from '../../components/DarkInput';
import DarkButton from '../../components/DarkButton';

export default function DarkLoginScreen() {
  return (
    <DarkScreenBackground>
      <DarkGlassCard variant="dark" padding={24}>
        <DarkInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          icon={<Text>✉️</Text>}
        />
        <DarkButton 
          label="Sign In" 
          onPress={handleLogin}
          variant="purple"
          icon="→"
        />
      </DarkGlassCard>
    </DarkScreenBackground>
  );
}
```

### Dashboard Screen

```tsx
export default function DarkStudentDashboard() {
  return (
    <DarkScreenBackground>
      <ScrollView>
        {/* Stats Card */}
        <DarkGlassCard variant="dark" glowColor="purple">
          <LinearGradient colors={darkColors.gradientPurple}>
            <Text>Your Progress</Text>
          </LinearGradient>
        </DarkGlassCard>

        {/* Assessment Cards */}
        <DarkGlassCard variant="medium">
          <Text>Learning Agility</Text>
        </DarkGlassCard>
      </ScrollView>
    </DarkScreenBackground>
  );
}
```

---

## Design Patterns

### 1. Glassmorphism
Use semi-transparent backgrounds with blur effects for cards and surfaces.

```tsx
<DarkGlassCard variant="dark">
  {/* Creates frosted glass effect */}
</DarkGlassCard>
```

### 2. Gradient Accents
Use JotMinds brand gradients for CTAs and highlights.

```tsx
<LinearGradient
  colors={darkColors.gradientPurple}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
>
  {/* Gradient content */}
</LinearGradient>
```

### 3. Glow Effects
Add subtle glows to important elements.

```tsx
<DarkGlassCard glowColor="purple">
  {/* Card with purple glow */}
</DarkGlassCard>

<DarkButton variant="cyan">
  {/* Button with cyan glow */}
</DarkButton>
```

### 4. Typography Hierarchy
- **Headers**: 28-36px, Bold/ExtraBold, White
- **Subheaders**: 18-20px, Bold, White/Light Gray
- **Body**: 14-16px, Regular/Medium, Medium Gray
- **Labels**: 11-12px, Bold, Uppercase, Muted

---

## Navigation Structure

### New Dark Theme Routes
All dark theme screens are accessible via navigation:

```tsx
// Login
navigation.navigate('DarkLogin');

// Onboarding
navigation.navigate('DarkOnboarding');

// Dashboard
navigation.navigate('DarkStudentDashboard');
```

---

## Comparison: Light vs Dark

| Feature | Light Theme | Dark Theme |
|---------|-------------|------------|
| Background | Lavender gradient | Deep blue-black `#020618` |
| Cards | White glass with blur | Dark glass `rgba(15,23,43,0.8)` |
| Text | Dark on light | White on dark |
| Accents | Same JotMinds colors | Same JotMinds colors |
| Shadows | Subtle gray | Glows with color |
| Feel | Soft, approachable | Premium, sophisticated |

---

## Best Practices

### ✅ Do
- Use dark glass cards for content sections
- Apply brand gradient overlays for CTAs
- Add subtle glows to interactive elements
- Maintain consistent border radius (14-24px)
- Use proper text color hierarchy

### ❌ Don't
- Mix light and dark themes in same screen
- Use pure black `#000000` - stick to `#020618`
- Overuse glow effects - be subtle
- Forget to handle safe areas on iOS
- Use low-contrast text colors

---

## Migration Guide

### Converting Light to Dark

1. **Replace Background Component**
```tsx
// Before
import ScreenBackground from '../../components/ScreenBackground';

// After
import DarkScreenBackground from '../../components/DarkScreenBackground';
```

2. **Replace Card Components**
```tsx
// Before
import GlassCard from '../../components/GlassCard';

// After
import DarkGlassCard from '../../components/DarkGlassCard';
```

3. **Update Colors**
```tsx
// Before
import { colors } from '../../theme';

// After
import { darkColors } from '../../theme-dark';
```

4. **Adjust Text Colors**
```tsx
// Before
color: colors.text // Dark gray

// After
color: darkColors.textPrimary // White
```

---

## Performance Tips

1. **Optimize Gradients**: Use `useNativeDriver` where possible
2. **Reduce Overdraw**: Limit nested transparent views
3. **Cache Icons**: Preload frequently used emojis/icons
4. **Lazy Load**: Use lazy loading for long lists
5. **Memoize**: Wrap expensive components in `React.memo`

---

## Accessibility

- **Contrast Ratio**: All text meets WCAG AA standards (4.5:1+)
- **Touch Targets**: Minimum 44x44pt tap areas
- **Screen Readers**: Proper `accessibilityLabel` on interactive elements
- **Focus Indicators**: Clear focus states for keyboard navigation

---

## Future Enhancements

- [ ] Animated theme switching
- [ ] User preference persistence
- [ ] Auto dark mode based on system settings
- [ ] Reduced motion mode
- [ ] High contrast mode

---

## Resources

- **Figma Design**: [Link to design files]
- **Color Palette**: See `theme-dark.ts`
- **Component Library**: `/src/components/Dark*`
- **Example Screens**: `/src/screens/*/Dark*`

---

**Questions?** Check the component files for implementation details or reach out to the design team!
