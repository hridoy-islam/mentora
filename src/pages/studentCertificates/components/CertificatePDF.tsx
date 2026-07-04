import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Circle,
  Rect,
  Image,
  Font,
} from '@react-pdf/renderer';

// ---------------------------------------------------------------------------
// Font Registration
// ---------------------------------------------------------------------------
// This runs in the browser, so we can't use require.resolve() (Node-only).
// Instead we point Font.register at the same static .woff files that
// @fontsource/cinzel and @fontsource/montserrat ship, served over jsDelivr's
// CDN mirror of npm. These are static (non-variable) WOFFs, which is why
// they avoid the "Unknown font format" error you got from raw Google Fonts
// URLs (those serve variable-font TTFs that react-pdf's fontkit can't parse).
//
// No npm install is required for this approach since the files are fetched
// at runtime — but installing the packages is still fine if you want them
// for other CSS/web use elsewhere in the app.
const FONT_CDN = 'https://cdn.jsdelivr.net/npm';

Font.register({
  family: 'Cinzel',
  fonts: [
    {
      src: `${FONT_CDN}/@fontsource/cinzel@5.2.8/files/cinzel-latin-400-normal.woff`,
      fontWeight: 400,
    },
    {
      src: `${FONT_CDN}/@fontsource/cinzel@5.2.8/files/cinzel-latin-700-normal.woff`,
      fontWeight: 700,
    },
   
  ],
});

Font.register({
  family: 'Great Vibes',
  fonts: [
    {
      src: `${FONT_CDN}/@fontsource/great-vibes@5.2.8/files/great-vibes-latin-400-normal.woff`,
      fontWeight: 400,
    },
  ],
});

Font.register({
  family: 'Montserrat',
  fonts: [
    {
      src: `${FONT_CDN}/@fontsource/montserrat@5.2.8/files/montserrat-latin-400-normal.woff`,
      fontWeight: 400,
    },
    {
      src: `${FONT_CDN}/@fontsource/montserrat@5.2.8/files/montserrat-latin-700-normal.woff`,
      fontWeight: 700,
    },
    {
      src: `${FONT_CDN}/@fontsource/montserrat@5.2.8/files/montserrat-latin-400-italic.woff`,
      fontWeight: 400,
      fontStyle: 'italic',
    },
  ],
});

// react-pdf can hyphenate/break words oddly with uppercase tracked-out text;
// disabling hyphenation keeps the certificate wording on clean lines.
Font.registerHyphenationCallback((word) => [word]);

interface CertificateProps {
  studentName?: string;
  courseTitle?: string;
  date?: string;
  certificateNo?: string;
}

// ---------------------------------------------------------------------------
// Constants & Styles
// ---------------------------------------------------------------------------
const PAGE_W = 842;
const PAGE_H = 595;

const C = {
  navy: '#22346E',
  lightBlue: '#329BD4',
  green: '#6CB042',
  white: '#FFFFFF',
  textDark: '#2D2D2D',
  textGray: '#5B5B5B',
  borderGray: '#C4C8D0',
} as const;

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    fontFamily: 'Montserrat',
    padding: 0,
    width: PAGE_W,
    height: PAGE_H,
    position: 'relative',
    overflow: 'hidden', // Prevents extra pages
  },
  // Outer border - slightly larger
  outerBorder: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 41, // Stop before the footer
    borderWidth: 1.5,
    borderColor: '#7A86A8',
  },
  // Inner border - slightly smaller (creates the double border effect)
  innerBorder: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    bottom: 49, // Stop before the footer
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  wavesWrap: {
    position: 'absolute',
    bottom: 35,
    right: -130,
    width: 600,
    height: 480,
    opacity: 0.25,
    scale: 1.5,
  },
  wavesImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  leftRibbonBox: {
    position: 'absolute',
    top: -5,
    left: 35,
    width: 110,
    height: 350,
    alignItems: 'center',
  },
  ribbonImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 110,
    height: 350,
  },
  ribbonContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    alignItems: 'center',
    paddingTop: 30,
  },
  ribbonIconBox: {
    width: 50,
    height: 50,
    backgroundColor: C.white,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ribbonLabel: {
    color: C.white,
    fontSize: 7.5,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    marginBottom: 8,
    textAlign: 'center',
  },
  ribbonDot: {
    width: 4,
    height: 4,
    backgroundColor: C.green,
    borderRadius: 2,
    marginBottom: 8,
  },
  headerLogoBox: {
    position: 'absolute',
    top: 50,
    left: 0,
    width: PAGE_W,
    alignItems: 'center',
  },
  logoImage: {
    width: 200,
    height: 50,
    objectFit: 'contain',
  },
  sealBox: {
    position: 'absolute',
    top: 20,
    right: 40,
    width: 150,
    height: 150,
  },
  sealImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  mainContentBox: {
    position: 'absolute',
    top: 120,
    left: 120,
    width: 630, // Span remaining width beside ribbon
    alignItems: 'center',
  },
  titleCertificate: {
    fontSize: 48,
    fontFamily: 'Cinzel',
    fontWeight: 400,
    color: C.navy,
    letterSpacing: 4,
    marginBottom: 20,
  },
  certifyText: {
    fontSize: 12,
    fontFamily: 'Montserrat',
    color: C.textDark,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  studentName: {
    fontSize: 26,
    fontFamily: 'Cinzel',
    fontWeight: 400,
    color: C.navy,
    marginBottom: 4,
    letterSpacing: 1,
  },
  nameLine: {
    width: 320,
    height: 1,
    backgroundColor: C.borderGray,
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 12,
    fontFamily: 'Montserrat',
    color: C.textDark,
    textAlign: 'center',
    lineHeight: 1.5,
    marginBottom: 8,
    paddingHorizontal: 50,
  },
  courseTitle: {
    fontSize: 28,
    fontFamily: 'Cinzel',
    fontWeight: 400,
    color: C.navy,
    marginBottom: 12,
    letterSpacing: 1,
  },
  bottomBox: {
    position: 'absolute',
    bottom: 80,
    left: 170,
    width: 610,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  bottomColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomColumnCenter: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTextWrap: {
    marginLeft: 8,
  },
  colLabel: {
    fontSize: 7,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    color: C.textDark,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  colValue: {
    fontSize: 9,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    color: C.textDark,
  },
signatureName: {
  fontSize: 22, // Slightly larger to match the style
  fontFamily: 'Great Vibes',
  fontWeight: 400,
  color: C.navy,
  marginBottom: 4,
},
  signatureLine: {
    width: 140,
    height: 1,
    backgroundColor: C.textDark,
    marginBottom: 4,
  },
  verticalDivider: {
    width: 1,
    height: 35,
    backgroundColor: C.borderGray,
  },
  footerBox: {
    position: 'absolute',
    bottom: 10,
    left: 8,
    width: 826,
    height: 45,
    backgroundColor: C.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  footerText: {
    color: C.white,
    fontSize: 8.5,
    fontFamily: 'Montserrat',
    marginLeft: 6,
  },
  footerDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
});

// ---------------------------------------------------------------------------
// SVG Components (kept for the small icons that are not being swapped for images)
// ---------------------------------------------------------------------------

const HandsHeartIcon = () => (
  <Svg viewBox="0 0 40 40" width="30" height="30">
    <Path
      d="M14 20 C12 16 13 13 16 12 C18 11 20 12 20 14 C20 12 22 11 24 12 C27 13 28 16 26 20 C24 24 20 28 20 28 C20 28 16 24 14 20 Z"
      fill={C.lightBlue}
    />
    <Path
      d="M8 22 C6 26 8 30 13 32 C15 33 18 32 19 30"
      stroke={C.navy} strokeWidth="1.5" fill="none" strokeLinecap="round"
    />
    <Path
      d="M32 22 C34 26 32 30 27 32 C25 33 22 32 21 30"
      stroke={C.navy} strokeWidth="1.5" fill="none" strokeLinecap="round"
    />
  </Svg>
);

const CalendarIcon = () => (
  <Svg viewBox="0 0 20 20" width="22" height="22">
    <Rect x="2" y="4" width="16" height="14" rx="2" fill="none" stroke={C.navy} strokeWidth="1.2" />
    <Path d="M2 9 L18 9" stroke={C.navy} strokeWidth="1.2" />
    <Path d="M6 2 L6 6" stroke={C.navy} strokeWidth="1.2" strokeLinecap="round" />
    <Path d="M14 2 L14 6" stroke={C.navy} strokeWidth="1.2" strokeLinecap="round" />
    <Rect x="5" y="12" width="2" height="2" fill={C.navy} />
    <Rect x="9" y="12" width="2" height="2" fill={C.navy} />
    <Rect x="13" y="12" width="2" height="2" fill={C.navy} />
  </Svg>
);

const BadgeIcon = () => (
  <Svg viewBox="0 0 24 24" width="24" height="24">
    <Circle cx="12" cy="10" r="6" fill="none" stroke={C.navy} strokeWidth="1.2" />
    <Circle cx="12" cy="10" r="4" fill="none" stroke={C.navy} strokeWidth="0.8" />
    <Path d="M9 15 L7 22 L12 19 L17 22 L15 15" fill="none" stroke={C.navy} strokeWidth="1.2" strokeLinejoin="round" />
  </Svg>
);

const EmailIcon = () => (
  <Svg viewBox="0 0 16 16" width="14" height="14">
    <Circle cx="8" cy="8" r="7.5" fill={C.white} />
    <Path d="M4 6 L8 9 L12 6" stroke={C.navy} strokeWidth="1" fill="none" strokeLinejoin="round" />
    <Rect x="3.5" y="5" width="9" height="6" rx="0.5" fill="none" stroke={C.navy} strokeWidth="1" />
  </Svg>
);

const GlobeIcon = () => (
  <Svg viewBox="0 0 16 16" width="14" height="14">
    <Circle cx="8" cy="8" r="7.5" fill={C.white} />
    <Path d="M8 0.5 C5 3 5 13 8 15.5 C11 13 11 3 8 0.5Z" fill="none" stroke={C.navy} strokeWidth="0.8" />
    <Path d="M1 8 L15 8" stroke={C.navy} strokeWidth="0.8" />
    <Path d="M2.5 4.5 L13.5 4.5" stroke={C.navy} strokeWidth="0.8" />
    <Path d="M2.5 11.5 L13.5 11.5" stroke={C.navy} strokeWidth="0.8" />
  </Svg>
);

// ---------------------------------------------------------------------------
// Certificate Document
// ---------------------------------------------------------------------------
export const CertificatePDF = ({
  studentName ,
  courseTitle ,
  date,
  certificateNo,
}: CertificateProps) => {
  return (
    <Document title={`${courseTitle} - ${studentName}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>

        {/* Double Borders - Outer first, then Inner */}
        <View style={styles.outerBorder} />
        <View style={styles.innerBorder} />

        {/* Background Graphic */}
        <View style={styles.wavesWrap}>
          <Image src="/pattern.png" style={styles.wavesImage} />
        </View>

        {/* Header Logo Box */}
        <View style={styles.headerLogoBox}>
          <Image src="/logo.png" style={styles.logoImage} />
        </View>

        {/* Top Right Seal */}
        <View style={styles.sealBox}>
          <Image src="/2.png" style={styles.sealImage} />
        </View>

        {/* Left Ribbon Box */}
        <View style={styles.leftRibbonBox}>
          <Image src="/1.png" style={styles.ribbonImage} />
          
        </View>

        {/* Main Text Content */}
        <View style={styles.mainContentBox}>
          <Text style={styles.titleCertificate}>CERTIFICATE</Text>
          <Text style={styles.certifyText}>THIS IS TO CERTIFY THAT</Text>
          <Text style={styles.studentName}>{studentName}</Text>
          <View style={styles.nameLine} />
          <Text style={styles.bodyText}>
            HAS SUCCESSFULLY COMPLETED ONLINE KNOWLEDGE-BASED{'\n'}TRAINING WITH MEDICARE TRAINING IN
          </Text>
          <Text style={styles.courseTitle}>{courseTitle}</Text>
          <Text style={styles.bodyText}>
            IN ACCORDANCE WITH THE STANDARDS AND GUIDANCE SET BY SKILLS FOR CARE, THE{'\n'}
            CARE QUALITY COMMISSION (CQC), NICE, AND NHS ENGLAND
          </Text>
        </View>

        {/* Bottom Signatures Box */}
        <View style={styles.bottomBox}>
          <View style={styles.bottomColumn}>
            <CalendarIcon />
            <View style={styles.iconTextWrap}>
              <Text style={styles.colLabel}>DATE OF COMPLETION</Text>
              <Text style={styles.colValue}>{date}</Text>
            </View>
          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.bottomColumnCenter}>
            <Text style={styles.signatureName}>Medicare Training</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.colLabel}>AUTHORISED BY</Text>
            <Text style={{ ...styles.colLabel, fontSize: 7, marginTop: 1, letterSpacing: 0 }}>Director / Course Director</Text>
          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.bottomColumn}>
            <BadgeIcon />
            <View style={styles.iconTextWrap}>
              <Text style={styles.colLabel}>CERTIFICATE ID</Text>
              <Text style={styles.colValue}>{certificateNo}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerBox}>
          <View style={styles.footerItem}>
            <EmailIcon />
            <Text style={styles.footerText}>info@medicaretraining.co.uk</Text>
          </View>
          <View style={styles.footerDivider} />
          <View style={styles.footerItem}>
            <GlobeIcon />
            <Text style={styles.footerText}>medicaretraining.co.uk</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};