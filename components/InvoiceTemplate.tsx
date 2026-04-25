import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottom: 1, pb: 10 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#18181b' },
  section: { margin: 10, padding: 10, flexGrow: 1 },
  table: { display: 'flex', width: 'auto', marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottom: 0.5, borderColor: '#e4e4e7', paddingVertical: 5 },
  tableCol: { width: '25%' },
  bold: { fontWeight: 'bold' }
});

export const InvoiceTemplate = ({ data }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>NORVINE INVOICE</Text>
        <Text>Nomor Invoice: {data.invoice}</Text>
        <Text>Tanggal: {new Date(data.createdAt).toLocaleDateString('id-ID')}</Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, { backgroundColor: '#f4f4f5' }]}>
          <Text style={[styles.tableCol, styles.bold]}>Produk</Text>
          <Text style={styles.tableCol}>Qty</Text>
          <Text style={styles.tableCol}>Harga</Text>
          <Text style={styles.tableCol}>Total</Text>
        </View>
        {data.items.map((item: any) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.tableCol}>{item.name}</Text>
            <Text style={styles.tableCol}>{item.quantity}</Text>
            <Text style={styles.tableCol}>Rp {item.price.toLocaleString()}</Text>
            <Text style={styles.tableCol}>Rp {(item.price * item.quantity).toLocaleString()}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 30, textAlign: 'right' }}>
        <Text style={styles.bold}>Total Pembayaran: Rp {data.totalAmount.toLocaleString()}</Text>
      </View>
    </Page>
  </Document>
);