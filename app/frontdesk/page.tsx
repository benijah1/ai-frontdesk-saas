// When using subdomains, configure middleware to rewrite /frontdesk to /_sub/[sub]/frontdesk.
// This page can show a generic landing or redirect logic as needed.
export default function FrontDeskRoot(){
return <div className="p-8">Front Desk</div>;
}
