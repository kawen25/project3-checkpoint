// D3.js script to visualize dengue cases vs. employment rate as a scatter plot with a filter for top N municipalities

// Set up dimensions
const margin = { top: 50, right: 50, bottom: 60, left: 70 },
    width = 900 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

// Create SVG container
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load data
const dataUrl = "employment_vs_dengue.json";

d3.json(dataUrl).then(data => {
    data.sort((a, b) => b.cases - a.cases);
    
    // Create filter container
    const filterContainer = d3.select("#chart").append("div")
        .attr("id", "filter-container")
        .style("margin-bottom", "15px");

    filterContainer.append("label")
        .attr("for", "topN")
        .text("Show top N municipalities: ")
        .style("font-weight", "bold");

    const filterInput = filterContainer.append("input")
        .attr("type", "number")
        .attr("id", "topN")
        .attr("min", 1)
        .attr("max", data.length)
        .attr("value", 10)
        .style("margin-right", "10px");

    filterContainer.append("button")
        .text("Apply Filter")
        .style("background", "#007BFF")
        .style("color", "white")
        .style("border", "none")
        .style("padding", "5px 10px")
        .style("border-radius", "5px")
        .style("cursor", "pointer")
        .on("mouseover", function() { d3.select(this).style("background", "#0056b3"); })
        .on("mouseout", function() { d3.select(this).style("background", "#007BFF"); })
        .on("click", () => {
            const topN = +document.getElementById("topN").value;
            updateChart(topN);
        });
    
    updateChart(10); // Default to top 10

    function updateChart(topN) {
        const filteredData = data.slice(0, topN);

        // Define scales
        const x = d3.scaleLinear()
            .domain([d3.min(filteredData, d => d.employed) - 2, d3.max(filteredData, d => d.employed) + 2])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.cases)])
            .nice()
            .range([height, 0]);

        // Remove existing elements
        svg.selectAll("*").remove();

        // Add X-axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d => d + "%"))
            .style("font-size", "12px");

        // Add Y-axis
        svg.append("g")
            .call(d3.axisLeft(y))
            .style("font-size", "12px");

        // Add Labels
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 50)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("Employment Rate (%)");

        svg.append("text")
            .attr("x", -height / 2)
            .attr("y", -50)
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("Total Dengue Cases (2019)");

        // Tooltip
        const tooltip = d3.select("body").append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "rgba(0, 0, 0, 0.7)")
            .style("color", "white")
            .style("border-radius", "5px")
            .style("padding", "8px")
            .style("font-size", "12px");
        
        // Add scatter points with transparency
        svg.selectAll("circle")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.employed))
            .attr("cy", d => y(d.cases))
            .attr("r", 7)
            .attr("fill", "steelblue")
            .attr("fill-opacity", 0.6)  // Apply transparency
            .attr("stroke", "#0056b3")
            .attr("stroke-width", "1.5px")
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible")
                    .html(`<strong>${d.Municipality}</strong><br>Dengue Cases: ${d.cases}<br>Employment Rate: ${d.employed}%`);
            })
            .on("mousemove", event => {
                tooltip.style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
            });
    }
});
