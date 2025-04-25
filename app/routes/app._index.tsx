import { Page, Layout, Card, Text, Avatar } from "@shopify/polaris";

const AdminHomePage = () => {
  return (
    <Page title="Welcome to Star Score">
      <Layout>
        <Layout.Section>
          <Card>
            <Card>
              <Text as="h1" variant="heading2xl">
                <Avatar customer name="Admin" />
                Welcome, Admin!
              </Text>
              <Text as="p" variant="bodyMd">
                Star score helps you collect and manage customer ratings on your
                Shopify store's products. Easily showcase product quality with a
                5-star rating system to build trust and boost conversions.
              </Text>
            </Card>
            <Card>
              <Text as="p" variant="bodyMd">
                Use the navigation to explore features like viewing product
                ratings, moderating feedback, and customizing your rating
                widget.
              </Text>
            </Card>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default AdminHomePage;
