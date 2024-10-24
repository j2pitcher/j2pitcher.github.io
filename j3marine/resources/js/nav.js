// This script will dynamically generate the navigation bar on all pages

// Define the HTML content for the navigation bar
let baseURL = "/"

if(currentPath.includes("/resources/pages/")) {
    baseURL = "resources/pages/";
}
const navHTML = `
    <ul>
        <li><a href="${baseURL === '/' ? './index.html' : '../../index.html'}"><button>Home Page</button></a></li>
        <li><a href="${baseURL}parts.html"><button>Parts Review</button></a></li>
        <li><a href="${baseURL}crm.html"><button>CRM Portal</button></a></li>
        <li><button>Marina Management</button></li>
        <li><button>Employee Portal</button></a></li>
    </ul>
`;

// Dynamically insert the navigation HTML into the page
document.getElementById('nav').innerHTML = navHTML;
