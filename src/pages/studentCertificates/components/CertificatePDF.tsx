import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font 
} from '@react-pdf/renderer';

// Optional: If you want to use Bold fonts, you must register them
// Font.register({
//   family: 'Helvetica-Bold',
//   src: 'https://fonts.gstatic.com/s/helveticaneue/v70/...' 
// });

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  date: string;
  certificateId?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
  },
  borderOuter: {
    flex: 1,
    border: '12pt solid #f8fafc', // Light slate border
    padding: 10,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    border: '2pt solid #1e293b', // Darker border
    padding: 40,
    position: 'relative',
  },
  title: {
    fontSize: 42,
    marginBottom: 20,
    textTransform: 'uppercase',
    color: '#0f172a',
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    color: '#64748b',
    fontFamily: 'Helvetica',
  },
  studentName: {
    fontSize: 36,
    color: '#0284c7', // Professional Blue
    marginBottom: 10,
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
  },
  courseName: {
    fontSize: 24,
    marginTop: 20,
    marginBottom: 40,
    textAlign: 'center',
    color: '#1e293b',
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1pt solid #e2e8f0',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
  }
});

export const CertificatePDF = ({ 
  studentName, 
  courseTitle, 
  date, 
  certificateId 
}: CertificateProps) => {
  // Fallback ID if none provided
  const displayId = certificateId || Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <Document title={`${courseTitle} - ${studentName}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.borderOuter}>
          <View style={styles.container}>
            <Text style={styles.title}>Certificate of Completion</Text>
            
            <Text style={styles.subtitle}>This is to certify that</Text>
            
            <Text style={styles.studentName}>{studentName}</Text>
            
            <Text style={styles.subtitle}>has successfully completed all requirements for</Text>
            
            <Text style={styles.courseName}>{courseTitle}</Text>

            <View style={styles.footer}>
              <View>
                <Text style={styles.footerText}>Date of Issue</Text>
                <Text style={{ fontSize: 12, marginTop: 4 }}>{date}</Text>
              </View>
              <View style={{ alignItems: 'right' }}>
                <Text style={styles.footerText}>Certificate ID</Text>
                <Text style={{ fontSize: 12, marginTop: 4 }}>{displayId}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};