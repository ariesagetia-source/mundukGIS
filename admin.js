// Koneksi ke Supabase
const supabaseUrl = 'https://ljqalgcsgxjpllghfqfp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqcWFsZ2NzZ3hqcGxsZ2hmcWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNTQ0NjQsImV4cCI6MjEwNTgzMDQ2NH0.IZlLWsKUGeCWtH-VDuoz80cySvaPCZnj76RIzF5fZXY'
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey)

const form = document.getElementById('dest-form');
const tbody = document.querySelector('#data-table tbody');

// Load Data dari Supabase
async function loadData() {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Memuat data...</td></tr>';
    
    const { data, error } = await supabaseClient.from('destinations')
        .select('*')
        .order('id', { ascending: false });
    
    if (error) {
        tbody.innerHTML = `<tr><td colspan="3" style="color:red">Error: ${error.message}</td></tr>`;
        return;
    }
    
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Belum ada data.</td></tr>';
    }

    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editItem(${item.id})">Edit</button>
                <button class="action-btn btn-delete" onclick="deleteItem(${item.id})">Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Simpan data global untuk fungsi edit
    window.allDestinations = data;
}

// Fungsi Edit Data
window.editItem = function(id) {
    const item = window.allDestinations.find(x => x.id === id);
    if(item) {
        document.getElementById('dest-id').value = item.id;
        document.getElementById('name').value = item.name;
        document.getElementById('description').value = item.description;
        document.getElementById('category').value = item.category;
        document.getElementById('lat').value = item.lat;
        document.getElementById('lng').value = item.lng;
        document.getElementById('image').value = item.image;
        
        // Scroll ke atas
        window.scrollTo(0, 0);
    }
}

// Fungsi Hapus Data
window.deleteItem = async function(id) {
    if(confirm('Yakin ingin menghapus destinasi ini?')) {
        const { error } = await supabaseClient.from('destinations').delete().eq('id', id);
        
        if(error) {
            alert('Gagal menghapus: ' + error.message);
        } else {
            alert('Data berhasil dihapus!');
            loadData();
        }
    }
}

// Reset Form
document.getElementById('btn-reset').addEventListener('click', () => {
    form.reset();
    document.getElementById('dest-id').value = '';
});

// Simpan Data (Insert atau Update)
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('dest-id').value;
    const destData = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        lat: parseFloat(document.getElementById('lat').value),
        lng: parseFloat(document.getElementById('lng').value),
        image: document.getElementById('image').value
    };
    
    let submitError = null;

    if (id) {
        // Update data yang sudah ada
        const { error } = await supabaseClient.from('destinations').update(destData).eq('id', id);
        submitError = error;
    } else {
        // Insert data baru
        const { error } = await supabaseClient.from('destinations').insert([destData]);
        submitError = error;
    }
    
    if (submitError) {
        alert('Gagal menyimpan: ' + submitError.message);
    } else {
        alert('Data berhasil disimpan!');
        form.reset();
        document.getElementById('dest-id').value = '';
        loadData();
    }
});

// Muat data saat halaman admin dibuka
loadData();
