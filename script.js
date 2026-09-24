// Koneksi ke Supabase
const supabaseUrl = 'https://ljqalgcsgxjpllghfqfp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqcWFsZ2NzZ3hqcGxsZ2hmcWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNTQ0NjQsImV4cCI6MjEwNTgzMDQ2NH0.IZlLWsKUGeCWtH-VDuoz80cySvaPCZnj76RIzF5fZXY'
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey)

// Inisialisasi Peta (Koordinat pusat Munduk)
const map = L.map('map').setView([-8.2600, 115.0750], 13);

// Tambahkan layer peta dari Google Maps
L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    attribution: '&copy; Google Maps'
}).addTo(map);

// Array untuk menyimpan referensi marker
const markers = {};
const listElement = document.getElementById('destination-list');

// Fungsi untuk menarik data dari Supabase
async function loadDestinations() {
    listElement.innerHTML = '<p style="padding: 1rem; text-align: center;">Mengunduh data dari database...</p>';
    
    // Ambil data dari tabel 'destinations'
    const { data: destinations, error } = await supabaseClient.from('destinations')
        .select('*');

    if (error) {
        console.error("Error fetching data:", error);
        listElement.innerHTML = `<p style="padding: 1rem; color: #dc3545;">Gagal memuat data: ${error.message}. <br>Pastikan tabel "destinations" sudah dibuat di Supabase!</p>`;
        return;
    }

    // Kosongkan list
    listElement.innerHTML = '';

    // Jika tidak ada data
    if (destinations.length === 0) {
        listElement.innerHTML = '<p style="padding: 1rem;">Belum ada data wisata. Silakan tambahkan melalui halaman Admin.</p>';
        return;
    }

    // Iterasi data destinasi untuk membuat marker
    destinations.forEach(dest => {
        const marker = L.marker([dest.lat, dest.lng]).addTo(map);
        
        const popupContent = `
            <div style="text-align: center; min-width: 180px;">
                <img src="${dest.image}" alt="${dest.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;">
                <h3 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 1.1em;">${dest.name}</h3>
                <span style="display: inline-block; padding: 2px 8px; background: #e9ecef; border-radius: 12px; font-size: 0.8em; color: #495057; margin-bottom: 12px;">
                    ${dest.category}
                </span>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}" target="_blank" rel="noopener noreferrer" style="display: block; background-color: #4285F4; color: white; text-decoration: none; padding: 8px; border-radius: 4px; font-weight: bold; font-size: 0.9em; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    📍 Rute Google Maps
                </a>
            </div>
        `;
        marker.bindPopup(popupContent);
        markers[dest.id] = marker;

        const li = document.createElement('li');
        li.innerHTML = `
            <h3>${dest.name}</h3>
            <p>${dest.description}</p>
        `;
        
        li.addEventListener('click', () => {
            map.flyTo([dest.lat, dest.lng], 16, { duration: 1.5 });
            marker.openPopup();
        });

        listElement.appendChild(li);
    });
}

// Panggil fungsi saat aplikasi dimulai
loadDestinations();
