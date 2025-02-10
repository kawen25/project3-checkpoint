// D3.js script to visualize dengue cases vs. employment rate as a scatter plot with a filter for top N municipalities

// Set up dimensions
const margin = { top: 50, right: 30, bottom: 50, left: 60 },
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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
    
    // Create filter dropdown
    const filterContainer = d3.select("#chart").append("div")
        .attr("id", "filter-container");

    filterContainer.append("label")
        .attr("for", "topN")
        .text("Show top N municipalities: ");

    const filterInput = filterContainer.append("input")
        .attr("type", "number")
        .attr("id", "topN")
        .attr("min", 1)
        .attr("max", data.length)
        .attr("value", 10);

    filterContainer.append("button")
        .text("Apply Filter")
        .on("click", () => {
            const topN = +document.getElementById("topN").value;
            updateChart(topN);
        });

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
            .call(d3.axisBottom(x).tickFormat(d => d + "%"));

        // Add Y-axis
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add Labels
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Employment Rate (%)");

        svg.append("text")
            .attr("x", -height / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .style("font-size", "14px")
            .text("Total Dengue Cases (2019)");

        // Tooltip
        const tooltip = d3.select("body").append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "white")
            .style("border", "1px solid black")
            .style("padding", "5px");
        
        // Add scatter points with transparency
        svg.selectAll("circle")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.employed))
            .attr("cy", d => y(d.cases))
            .attr("r", 6)
            .attr("fill", "steelblue")
            .attr("fill-opacity", 0.5)  // Apply transparency
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
