import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Circle,
  Image,
} from '@react-pdf/renderer';

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  courseSubtitle?: string;
  certificateNo: string;
}

const COLORS = {
  bg: '#f8fafc',
  bandBg: '#edf2f7',
  textDark: '#1e293b',
  textMuted: '#64748b',
  accent: '#233e99',
  accentLight: '#29abe2',
  accentDark: '#162a6b',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.bg,
    fontFamily: 'Helvetica',
  },
  body: {
    paddingTop: 60,
    paddingLeft: 60,
    paddingRight: 60,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 160,
    height: 52,
    objectFit: 'contain',
  },
  badgeWrap: {
    position: 'absolute',
    top: 55,
    right: 55,
  },
  eyebrow: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  eyebrowStrong: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.textDark,
    letterSpacing: 1,
  },
  nameScript: {
    fontSize: 46,
    color: COLORS.textDark,
    marginTop: 36,
    marginBottom: 30,
    fontFamily: 'Helvetica-Oblique',
  },
  bodyText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 1.5,
    marginBottom: 4,
  },
  courseTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.accent,
    marginTop: 26,
    marginBottom: 10,
  },
  courseSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 1.5,
    maxWidth: 420,
  },
  footerContainer: {
    marginTop: 'auto',
    position: 'relative',
  },
  cpdLogoWrap: {
    position: 'absolute',
    // Negative top value allows it to sit perfectly above the footerBand layout
    top: -10,   
    right: 40,  
  },
  cpdLogo: {
    width: 180,
    height: 90,
    objectFit: 'contain',
  },
  footerBand: {
    backgroundColor: COLORS.bandBg,
    paddingTop: 22,
    paddingBottom: 22,
    paddingLeft: 60,
    paddingRight: 60,
    flexDirection: 'row',
    marginBottom: 30,
  },
  footerCol: {
    marginRight: 70,
  },
  footerLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  footerValue: {
    fontSize: 13,
    color: COLORS.textDark,
    fontFamily: 'Helvetica-Bold',
  },
});

const Badge = () => (
  <Svg width={150} height={170} viewBox="0 0 150 170">
    {/* 1. BACKGROUND RIBBONS (Rendered first so they sit behind the circle) */}
    {/* Left Ribbon Tail */}
    <Path 
      d="M45 65 L40 155 L65 140 L90 155 L75 65 Z" 
      fill={COLORS.accentDark} 
    />
    {/* Right Ribbon Tail */}
    <Path 
      d="M105 65 L110 155 L85 140 L60 155 L75 65 Z" 
      fill={COLORS.accentLight} 
      opacity={0.9}
    />

    {/* 2. MAIN BADGE EMBLEM */}
    {/* Outer Solid Circle */}
    <Circle cx="75" cy="65" r="58" fill={COLORS.accent} />
    
    {/* Inner White Accent Ring */}
    <Circle cx="75" cy="65" r="46" fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.8} />

    {/* 3. CENTERED CHECKMARK */}
    <Path
      d="M56 66 L69 79 L94 51"
      stroke="#ffffff"
      strokeWidth={5.5}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CertificatePDF = ({
  studentName,
  courseTitle,
  courseSubtitle,
  certificateNo,
}: CertificateProps) => {
  const today = new Date();
  const issuedDate = today.toLocaleDateString('en-GB');
  const expiry = new Date(today);
  expiry.setFullYear(expiry.getFullYear() + 1);
  const expiryDate = expiry.toLocaleDateString('en-GB');

  return (
    <Document title={`${courseTitle} - ${studentName}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.body}>
          <View style={styles.brandRow}>
            <Image src="/logo.png" style={styles.logo} />
          </View>

          <View style={styles.badgeWrap}>
            <Badge />
          </View>

          <Text style={styles.eyebrowStrong}>CERTIFICATE OF</Text>
          <Text style={styles.eyebrow}>SUCCESSFUL COMPLETION</Text>

          <Text style={styles.nameScript}>{studentName}</Text>

          <Text style={styles.bodyText}>
            has successfully completed an in-house training with
          </Text>
          <Text style={styles.bodyText}>
            Medicare Training for a CPD certified course in
          </Text>

          <Text style={styles.courseTitle}>{courseTitle}</Text>

          {courseSubtitle ? (
            <Text style={styles.courseSubtitle}>{courseSubtitle}</Text>
          ) : null}
        </View>

        {/* The footer container container */}
        <View style={styles.footerContainer}>
          {/* 1. Render background element first */}
          <View style={styles.footerBand}>
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Issued Date</Text>
              <Text style={styles.footerValue}>{issuedDate}</Text>
            </View>
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Expiry Date</Text>
              <Text style={styles.footerValue}>{expiryDate}</Text>
            </View>
          </View>

          {/* 2. Render absolute overlay elements last to overlay them properly */}
          <View style={styles.cpdLogoWrap}>
            <Image src="/cpd-certified-logo.png" style={styles.cpdLogo} />
          </View>
        </View>
      </Page>
    </Document>
  );
};